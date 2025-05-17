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
import styles from "@/style/deckbuilder/CompactWatchlistStyle";
import { theme } from "@/style/ui/Theme";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import { addWatchList, getWatchLists } from "@/lib/userDatabase";

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

interface CompactWatchlistProps {
  watchlist: {
    id: number;
    name: string;
    thumbnail: string | null;
  };
  onImageLoad?: () => void;
  loading?: boolean;
  layout: "view" | "edit";
  onDelete?: (id: number) => void;
}

export default function CompactWatchlist({ watchlist, onImageLoad, layout, loading, onDelete }: CompactWatchlistProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(watchlist.name);
  const [editThumbnail, setEditThumbnail] = useState(watchlist.thumbnail || "");
  const [saving, setSaving] = useState(false);
  const imageSource = getDeckImage(watchlist.thumbnail || "");
  const router = useRouter();
  const { incrementDecksVersion, db: userDb } = useUserDatabase();
  const { db: cardDb } = useCardDatabase();

  const handleDeletePress = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    setShowModal(false);
    if (onDelete) onDelete(watchlist.id);
  };

  const handleCloneWatchlist = async () => {
    if (!watchlist) return;
    let baseName = watchlist.name.replace(/#\d+$/, "").trim();
    let cloneNumber = 1;
    let newName = `${baseName} #${cloneNumber}`;
    try {
      if (!userDb) return;
      const allWatchlists = await getWatchLists(userDb);
      const regex = new RegExp(`^${baseName} #(\\d+)$`);
      const usedNumbers = allWatchlists
        .map((d) => {
          const match = d.name.match(regex);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((n) => n !== null);
      while (usedNumbers.includes(cloneNumber)) {
        cloneNumber++;
        newName = `${baseName} #${cloneNumber}`;
      }
      const cards = (watchlist as any).cards ? (watchlist as any).cards : "[]";
      await addWatchList(userDb, newName, cards, watchlist.thumbnail || undefined);
      incrementDecksVersion();
    } catch (e) {
      console.error("Failed to clone watchlist", e);
    }
  };

  const handleEditPress = () => {
    setEditName(watchlist.name);
    setEditThumbnail(watchlist.thumbnail || "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!userDb || !editName.trim()) return;
    setSaving(true);
    try {
      await userDb.runAsync("UPDATE WatchedCards SET name = ?, thumbnail = ? WHERE id = ?", [
        editName,
        editThumbnail || null,
        watchlist.id,
      ]);
      incrementDecksVersion();
      setEditModalVisible(false);
    } catch (e) {
      console.error("Error updating watchlist:", e);
    } finally {
      setSaving(false);
    }
  };

  // Helper to select thumbnail by cardId (used in edit modal)
  const handleThumbnailSelect = async (cardId: string) => {
    if (!cardDb) return;
    try {
      const card = await cardDb.getFirstAsync<{ imagesLarge: string }>(
        "SELECT imagesLarge FROM Card WHERE cardId = ?",
        [cardId]
      );
      if (card && card.imagesLarge) {
        setEditThumbnail(card.imagesLarge);
      }
    } catch (e) {
      console.error("[CompactWatchlist] Error fetching card image for thumbnail:", e, { cardId, cardDb });
      if (e && (e as any).stack) {
        console.error("[CompactWatchlist] Error stack:", (e as any).stack);
      }
    }
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
        <View style={styles.watchlistName}>
          <ThemedText
            type="h3"
            color={theme.colors.white}
            style={{ paddingTop: theme.padding.medium }}
          >
            {watchlist.name}
          </ThemedText>
          {layout === "edit" && (
            <ThemedButton
              title="View Watchlist"
              type="main"
              size="small"
              width={vw(34)}
              onPress={() =>
                router.push({ pathname: "/watchlists/[watchlistId]", params: { watchlistId: watchlist.id } })
              }
            />
          )}
        </View>
        <>
          {layout === "edit" && (
            <View style={styles.watchlistButtons}>
              <ThemedView layout="box">
                <ThemedButton
                  title="Clone"
                  type="outline"
                  size="small"
                  style={{ marginBottom: theme.padding.medium * 0.8 }}
                  onPress={handleCloneWatchlist}
                />
                <ThemedButton
                  title="Edit"
                  type="outline"
                  size="small"
                  style={{ marginBottom: theme.padding.medium }}
                  onPress={handleEditPress}
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
            <View style={[styles.watchlistButtons, { justifyContent: "flex-end", alignItems: "flex-end" }]}>
              <ThemedButton
                title="View Watchlist"
                type="main"
                size="small"
                onPress={() =>
                  router.push({ pathname: "/watchlists/[watchlistId]", params: { watchlistId: watchlist.id } })
                }
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
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
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
          Delete Watchlist?
        </ThemedText>
        <ThemedText
          color={theme.colors.grey}
          style={{ textAlign: "center", paddingBottom: theme.padding.small }}
        >
          Are you sure you want to delete '{watchlist.name}'? This action cannot be undone.
        </ThemedText>
      </ThemedModal>
      <ThemedModal
        visible={editModalVisible}
        onClose={handleSaveEdit}
        buttonText={saving ? "Saving..." : "Save"}
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setEditModalVisible(false)}
      >
        <CardAutoCompleteProvider>
          <ThemedText
            type="h2"
            color={theme.colors.white}
            style={{ marginTop: theme.padding.small, marginBottom: theme.padding.medium, textAlign: "center" }}
          >
            Edit Watchlist
          </ThemedText>
          <ThemedTextInput
            value={editName}
            onChange={setEditName}
            placeholder="Enter watchlist name"
            style={{ marginBottom: theme.padding.medium }}
          />
          <CardAutoCompleteInput
            key={watchlist.id}
            value={editThumbnail}
            onCardSelect={handleThumbnailSelect}
            placeholder="Type card name (min 3 chars)"
            maxChars={25}
            resetKey={watchlist.id}
          />
          <CardAutoCompleteSuggestions onCardSelect={handleThumbnailSelect} />
        </CardAutoCompleteProvider>
      </ThemedModal>
    </View>
  );
}
