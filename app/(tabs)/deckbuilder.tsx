import React, { useState, useEffect, useCallback } from "react";
import MainScrollView from "@/components/ui/MainScrollView";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addDeck, getSavedDecks, deleteDeck } from "@/lib/userDatabase";
import NewDeck from "@/components/deckbuilder/NewDeck";
import SavedDecks from "@/components/deckbuilder/SavedDecks";
import { theme } from "@/style/ui/Theme";
import { BackHandler } from "react-native"; // Add this import
import { useRouter } from "expo-router"; // Add this import

interface SavedDeck {
  id: number;
  name: string;
  thumbnail: string | null;
  cards: string;
}

export default function DeckBuilderScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { db, isLoading: dbLoading, error: dbError, decksVersion, incrementDecksVersion } = useUserDatabase();
  const router = useRouter(); // Initialize router

  const [deckName, setDeckName] = useState("");
  const [deckThumbnail, setDeckThumbnail] = useState("");
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSavedDecks = useCallback(async () => {
    if (!db) return;
    setIsLoadingDecks(true);
    try {
      const decks = await getSavedDecks(db);
      setSavedDecks(decks);
    } catch (error) {
      console.error("Failed to fetch saved decks:", error);
    } finally {
      setIsLoadingDecks(false);
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      fetchSavedDecks();
    }
  }, [db, decksVersion, fetchSavedDecks]);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      if (db) {
        fetchSavedDecks();
      }
    }, [db, fetchSavedDecks])
  );

  const handleSaveDeck = async () => {
    if (!db) {
      console.warn("Error", "Database not available.");
      return;
    }
    try {
      await addDeck(db, deckName, deckThumbnail || undefined);
      setDeckName("");
      setDeckThumbnail("");
      fetchSavedDecks();
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
        await fetchSavedDecks();
        if (typeof incrementDecksVersion === "function") incrementDecksVersion();
      } catch (e) {
        console.error("Failed to delete deck", e);
      } finally {
        setDeletingId(null);
      }
    },
    [db, fetchSavedDecks, incrementDecksVersion]
  );

  const handleThumbnailSelect = (imagesLargeUrl: string) => {
    setDeckThumbnail(imagesLargeUrl);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace("/");
        return true; // Prevent default behavior (closing app)
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => subscription.remove();
    }, [router])
  );

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
        savedDecks={savedDecks}
        isLoadingDecks={isLoadingDecks}
        onDelete={handleDeleteDeck}
        deletingId={deletingId}
        layout="edit"
        style={{ marginTop: theme.padding.large * -1 }}
      />
    </MainScrollView>
  );
}
