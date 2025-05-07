import React, { useState, useEffect, useCallback } from "react";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addDeck, getSavedDecks } from "@/lib/userDatabase";
import NewDeck from "@/components/deckbuilder/NewDeck";
import SavedDecks from "@/components/deckbuilder/SavedDecks";

interface SavedDeck {
  id: number;
  name: string;
  thumbnail: string | null;
  cards: string;
}

export default function DeckBuilderScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { db, isLoading: dbLoading, error: dbError } = useUserDatabase();

  const [deckName, setDeckName] = useState("");
  const [deckThumbnail, setDeckThumbnail] = useState("");
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);

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
  }, [db, fetchSavedDecks]);

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
      console.log("Error", "Database not available.");
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

  const handleThumbnailSelect = (imagesLargeUrl: string) => {
    setDeckThumbnail(imagesLargeUrl);
  };

  return (
    <ParallaxScrollView
      headerImage="deck-builder-bkg"
      headerTitle="Pokémon Deck Builder"
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
      />
    </ParallaxScrollView>
  );
}
