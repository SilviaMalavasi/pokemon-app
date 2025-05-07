import React, { useState, useEffect, useCallback } from "react";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addDeck, getSavedDecks } from "@/lib/userDatabase";
import { Alert, FlatList, View } from "react-native";

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
      Alert.alert("Error", "Failed to load saved decks.");
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
      // Re-fetch decks when the screen comes into focus
      if (db) {
        fetchSavedDecks();
      }
    }, [db, fetchSavedDecks])
  );

  const handleSaveDeck = async () => {
    if (!db) {
      Alert.alert("Error", "Database not available.");
      return;
    }
    if (!deckName.trim()) {
      Alert.alert("Validation", "Deck Name cannot be empty.");
      return;
    }
    try {
      await addDeck(db, deckName, deckThumbnail || undefined);
      Alert.alert("Success", "Deck saved successfully!");
      setDeckName("");
      setDeckThumbnail("");
      fetchSavedDecks(); // Refresh the list of saved decks
    } catch (error) {
      console.error("Failed to save deck:", error);
      Alert.alert("Error", "Failed to save deck.");
    }
  };

  if (dbLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>Loading database...</ThemedText>
      </ThemedView>
    );
  }

  if (dbError) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>Error loading database: {dbError.message}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerImage="deck-builder-bkg"
      headerTitle="Pokémon Deck Builder"
      scrollRef={scrollRef}
    >
      <ThemedView style={{ padding: 16 }}>
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 16 }}
        >
          New Deck
        </ThemedText>
        <ThemedTextInput
          label="Deck Name"
          value={deckName}
          onChange={setDeckName}
          placeholder="Enter deck name"
        />
        <ThemedTextInput
          label="Deck Thumbnail (Optional)"
          value={deckThumbnail}
          onChange={setDeckThumbnail}
          placeholder="Enter image URL or keyword"
        />
        <ThemedButton
          title="Save Deck"
          onPress={handleSaveDeck}
        />
      </ThemedView>

      <ThemedView style={{ padding: 16, marginTop: 24 }}>
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 16 }}
        >
          Saved Decks
        </ThemedText>
        {isLoadingDecks ? (
          <ThemedText>Loading decks...</ThemedText>
        ) : savedDecks.length === 0 ? (
          <ThemedText>No saved decks yet.</ThemedText>
        ) : (
          <FlatList
            data={savedDecks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ThemedView style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
                <ThemedText>{item.name}</ThemedText>
              </ThemedView>
            )}
          />
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}
