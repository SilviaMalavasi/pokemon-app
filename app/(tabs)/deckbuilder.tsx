import React, { useState, useCallback } from "react";
import MainScrollView from "@/components/ui/MainScrollView";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addDeck, deleteDeck } from "@/lib/userDatabase";
import NewDeck from "@/components/deckbuilder/NewDeck";
import SavedDecks from "@/components/deckbuilder/SavedDecks";
import { theme } from "@/style/ui/Theme";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";

export default function DeckBuilderScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const {
    db,
    isLoading: dbLoading,
    error: dbError,
    decksVersion,
    incrementDecksVersion,
    decks,
    isLoadingDecks,
  } = useUserDatabase();
  const router = useRouter();

  const [deckName, setDeckName] = useState("");
  const [deckThumbnail, setDeckThumbnail] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSaveDeck = async () => {
    if (!db) {
      console.warn("Error", "Database not available.");
      return;
    }
    try {
      await addDeck(db, deckName, deckThumbnail || undefined);
      setDeckName("");
      setDeckThumbnail("");
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
    } catch (error) {
      console.error("Failed to save deck:", error);
    }
  };

  const handleDeleteDeck = useCallback(
    async (id: number) => {
      if (!db) return;
      setDeletingId(id);
      try {
        await deleteDeck(db, id);
        if (typeof incrementDecksVersion === "function") incrementDecksVersion();
        router.replace("/"); // Navigate to home or desired screen after delete
      } catch (e) {
        console.error("Failed to delete deck", e);
      } finally {
        setDeletingId(null);
      }
    },
    [db, incrementDecksVersion, router]
  );

  const handleThumbnailSelect = (imagesLargeUrl: string) => {
    setDeckThumbnail(imagesLargeUrl);
  };

  if (dbLoading) {
    return (
      <MainScrollView
        headerImage="deck-bkg"
        headerTitle="Deck Builder"
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ActivityIndicator
            size="large"
            color={theme.colors.purple}
          />
        </View>
      </MainScrollView>
    );
  }
  if (dbError) {
    console.error("Error loading database:", dbError);
    // Optionally, you could return null or a fallback UI here, but per user request, just log.
  }

  return (
    <MainScrollView
      headerImage="deck-bkg"
      headerTitle="Deck Builder"
      scrollRef={scrollRef}
    >
      <NewDeck
        deckName={deckName}
        setDeckName={setDeckName}
        deckThumbnail={deckThumbnail}
        setDeckThumbnail={setDeckThumbnail}
        handleSaveDeck={handleSaveDeck}
        handleThumbnailSelect={handleThumbnailSelect}
      />
      <SavedDecks
        savedDecks={decks}
        isLoadingDecks={isLoadingDecks}
        onDelete={handleDeleteDeck}
        deletingId={deletingId}
        layout="edit"
        style={{ marginTop: theme.padding.large * -1 }}
      />
    </MainScrollView>
  );
}
