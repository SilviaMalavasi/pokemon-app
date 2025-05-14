import React, { useState, useEffect, useCallback } from "react";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addDeck, getSavedDecks, deleteDeck } from "@/lib/userDatabase";
import NewDeck from "@/components/deckbuilder/NewDeck";
import SavedDecks from "@/components/deckbuilder/SavedDecks";

interface SavedDeck {
  id: number;
  name: string;
  thumbnail: string | null;
  cards: string;
}

export default function WatchlistScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { db, isLoading: dbLoading, error: dbError, decksVersion } = useUserDatabase();

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
      } catch (e) {
        console.error("Failed to delete deck", e);
      } finally {
        setDeletingId(null);
      }
    },
    [db, fetchSavedDecks]
  );

  const handleThumbnailSelect = (imagesLargeUrl: string) => {
    setDeckThumbnail(imagesLargeUrl);
  };

  return (
    <ParallaxScrollView
      headerImage="deck-builder-bkg"
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
      />
    </ParallaxScrollView>
  );
}
