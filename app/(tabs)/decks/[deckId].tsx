import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import FloatingButton from "@/components/ui/FloatingButton";
import { theme } from "@/style/ui/Theme";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AddCardToDeck from "@/components/deckbuilder/AddCardToDeck";
import DeckCardList from "@/components/deckbuilder/DeckCardList";

export default function DeckScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const [deck, setDeck] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const router = useRouter();
  const { db, isLoading: dbLoading, error } = useUserDatabase();

  const handleBack = () => {
    router.replace("/deckbuilder");
  };

  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [deckId])
  );

  useEffect(() => {
    if (!deckId || !db) return;
    const fetchDeck = async () => {
      setLoading(true);
      try {
        const deckData = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [Number(deckId)]);
        setDeck(deckData);
      } catch (error) {
        console.error("Error fetching deck from SQLite:", error);
        setDeck(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDeck();
  }, [deckId, db]);

  // Helper to parse deck.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(deck?.cards) ? deck.cards : JSON.parse(deck?.cards || "[]");
    } catch {
      return [];
    }
  };

  return (
    <>
      <ParallaxScrollView
        headerImage="deck-bkg"
        headerTitle={deck.name}
        scrollRef={scrollRef}
      >
        <ThemedView>
          {loading || dbLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.textAlternative}
              style={{ marginTop: 200 }}
            />
          ) : error ? (
            <ThemedText>Error loading deck: {error.message}</ThemedText>
          ) : deck ? (
            <>
              <AddCardToDeck
                deck={deck}
                db={db}
                onCardAdded={async () => {
                  // Refresh deck after card is added
                  if (db) {
                    const updatedDeck = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
                    setDeck(updatedDeck);
                  }
                }}
              />
              <DeckCardList
                cards={getCardsArray()}
                deckId={Number(deckId)}
                onCardsChanged={async () => {
                  if (db) {
                    const updatedDeck = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
                    setDeck(updatedDeck);
                  }
                }}
              />
            </>
          ) : (
            <ThemedText>Deck not found.</ThemedText>
          )}
        </ThemedView>
      </ParallaxScrollView>
      <SafeAreaView
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          paddingBottom: 16,
          zIndex: 100,
        }}
      >
        <FloatingButton
          title="Back to deckbuilder"
          onPress={handleBack}
        />
      </SafeAreaView>
    </>
  );
}
