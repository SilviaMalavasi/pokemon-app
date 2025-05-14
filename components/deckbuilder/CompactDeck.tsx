import React, { useState } from "react";
import { View, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { Svg, Path } from "react-native-svg";
import ThemedText from "@/components/base/ThemedText";
import ThemedModal from "@/components/base/ThemedModal";
import { Link } from "expo-router";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";
import cardImages from "@/helpers/cardImageMapping";
import styles from "@/style/deckbuilder/CompactDeckStyle";

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
  onDelete?: (id: number) => void;
}

export default function CompactDeck({ deck, onImageLoad, loading, onDelete }: CompactDeckProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const imageSource = getDeckImage(deck.thumbnail || "");

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
          color={theme.colors.greyAlternative}
        />
      </View>
    );
  }

  return (
    <Link href={{ pathname: "/decks/[deckId]", params: { deckId: deck.id } }}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {imageSource ? (
            <View style={{ position: "relative", justifyContent: "center", alignItems: "center" }}>
              <Image
                source={imageSource}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => {
                  setImageLoading(false);
                  if (onImageLoad) onImageLoad();
                }}
              />
              {typeof onDelete === "function" && (
                <TouchableOpacity
                  onPress={handleDeletePress}
                  style={styles.deleteButton}
                  accessibilityLabel="Delete deck"
                >
                  <View style={styles.button}>
                    <View style={styles.iconContainerStyle}>
                      <Svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 330.64 367.15"
                      >
                        <Path
                          d="M291.19,61.94h-40.46v-22.47c-.1-17.34-14.13-31.37-31.47-31.47H111.38c-17.34,.1-31.37,14.13-31.47,31.47v22.47H39.45c-17.33,.1-31.37,14.13-31.45,31.47v17.97c.05,10.84,11.06,20.38,19.41,26.04l32.18,195.48c2.48,15.22,15.68,26.36,31.1,26.25H239.94c15.42,.12,28.62-11.02,31.1-26.25l32.57-195.02c10.01-5.27,18.97-14.4,19.03-26.5v-17.97c-.08-17.34-14.13-31.37-31.45-31.47Zm-159.95,.38v-13.1c0-1.45,1.18-2.62,2.62-2.62h62.92c.7,0,1.37,.28,1.86,.77,.49,.49,.77,1.16,.77,1.86v13.1s-68.17,0-68.17,0Z"
                          stroke="#fff"
                          strokeMiterlimit="10"
                          strokeWidth="16"
                        />
                        <Path
                          d="M115.47,200.98c-7.79-7.79-8.68-19.58-1.95-26.3,6.71-6.71,18.52-5.83,26.3,1.95l25.51,25.51,25.51-25.51c7.79-7.79,19.58-8.68,26.3-1.95,6.71,6.71,5.83,18.52-1.95,26.3l-25.51,25.51,25.51,25.51c7.81,7.81,8.67,19.59,1.95,26.3s-18.5,5.85-26.3-1.95l-25.51-25.51-25.51,25.51c-7.81,7.81-19.59,8.67-26.3,1.95-6.73-6.73-5.85-18.5,1.95-26.3l25.51-25.51-25.51-25.51Z"
                          stroke="#fff"
                          strokeMiterlimit="10"
                          strokeWidth="16"
                        />
                      </Svg>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              {imageLoading && (
                <ActivityIndicator
                  style={{ position: "absolute" }}
                  size="small"
                  color={theme.colors.greyAlternative}
                />
              )}
            </View>
          ) : null}
        </View>
        <View style={styles.textContainer}>
          <ThemedText
            type="default"
            style={{ textAlign: "center" }}
          >
            {deck.name}
          </ThemedText>
        </View>
        <ThemedModal
          visible={showModal}
          onClose={handleConfirmDelete}
          buttonText="Delete"
          buttonType="main"
          buttonSize="large"
          onCancel={() => setShowModal(false)}
        >
          <ThemedText
            type="h2"
            style={{ marginTop: theme.padding.small, marginBottom: theme.padding.medium, textAlign: "center" }}
          >
            Delete Deck?
          </ThemedText>
          <ThemedText>Are you sure you want to delete '{deck.name}'? This action cannot be undone.</ThemedText>
        </ThemedModal>
      </View>
    </Link>
  );
}
