import React, { useState } from "react";
import { View, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { Svg, Path } from "react-native-svg";
import ThemedText from "@/components/base/ThemedText";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedButton from "../base/ThemedButton";
import ThemedView from "@/components/ui/ThemedView";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { vw } from "@/helpers/viewport";
import cardImages from "@/helpers/cardImageMapping";
import styles from "@/style/deckbuilder/CompactDeckStyle";
import { theme } from "@/style/ui/Theme";

function getDeckImage(imagePath: string) {
  // Always show the default image if no thumbnail is provided
  if (!imagePath) {
    return require("@/assets/images/back-card.webp");
  }
  const filename = imagePath.split("/").pop() || "";
  // Workaround: if the path is the default image, use require from /assets/images
  if (imagePath === "/images/back-card.webp" || filename === "back-card.webp") {
    return require("@/assets/images/back-card.webp");
  }
  return cardImages[filename];
}

interface CompactDeckProps {
  deck: {
    id: number;
    name: string;
    thumbnail: string | null;
  };
  onImageLoad?: () => void;
  loading?: boolean;
  layout: "view" | "edit";
  onDelete?: (id: number) => void;
}

export default function CompactDeck({ deck, onImageLoad, layout, loading, onDelete }: CompactDeckProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const imageSource = getDeckImage(deck.thumbnail || "");
  const router = useRouter();

  const handleDeletePress = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    setShowModal(false);
    if (onDelete) onDelete(deck.id);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", minHeight: vw(68) }]}>
        <ActivityIndicator
          size="large"
          color={theme.colors.purple}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.deckName}>
          <ThemedText
            type="h3"
            color={theme.colors.white}
            style={{ paddingTop: theme.padding.medium }}
          >
            {deck.name}
          </ThemedText>
          {layout === "edit" && (
            <ThemedButton
              title="View Deck"
              type="main"
              size="small"
              onPress={() => router.push({ pathname: "/decks/[deckId]", params: { deckId: deck.id } })}
            />
          )}
        </View>
        <>
          {layout === "edit" && (
            <View style={styles.deckButtons}>
              <ThemedView layout="box">
                <ThemedButton
                  title="Clone"
                  type="outline"
                  size="small"
                  style={{ marginBottom: theme.padding.medium * 0.8 }}
                />
                <ThemedButton
                  title="Edit"
                  type="outline"
                  size="small"
                  style={{ marginBottom: theme.padding.medium }}
                />
                <ThemedButton
                  title="Delete"
                  type="alternative"
                  size="small"
                  onPress={handleDeletePress}
                />
              </ThemedView>
            </View>
          )}
          {layout === "view" && (
            <View style={[styles.deckButtons, { justifyContent: "flex-end", alignItems: "flex-end" }]}>
              <ThemedButton
                title="View Deck"
                type="main"
                size="small"
                onPress={() => router.push({ pathname: "/decks/[deckId]", params: { deckId: deck.id } })}
                style={{ marginBottom: theme.padding.medium }}
              />
            </View>
          )}
        </>
      </View>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0)"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.imageOverlay}
      />
      <View style={styles.imageContainer}>
        {imageSource ? (
          <>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="stretch"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => {
                setImageLoading(false);
                if (onImageLoad) onImageLoad();
              }}
            />
            {imageLoading && (
              <ActivityIndicator
                style={{ position: "absolute" }}
                size="small"
                color={theme.colors.purple}
              />
            )}
          </>
        ) : null}
      </View>
      <ThemedModal
        visible={showModal}
        onClose={handleConfirmDelete}
        buttonText="Delete"
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setShowModal(false)}
      >
        <ThemedText
          type="h2"
          color={theme.colors.white}
          style={{ marginTop: theme.padding.small, marginBottom: theme.padding.medium, textAlign: "center" }}
        >
          Delete Deck?
        </ThemedText>
        <ThemedText
          color={theme.colors.grey}
          style={{ textAlign: "center", paddingBottom: theme.padding.small }}
        >
          Are you sure you want to delete '{deck.name}'? This action cannot be undone.
        </ThemedText>
      </ThemedModal>
    </View>
  );
}
