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
        const deckData = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
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

  return (
    <>
      <ParallaxScrollView
        headerImage="deck-bkg"
        headerTitle="Deck Details"
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
              <ThemedText
                type="title"
                style={{ marginBottom: 12 }}
              >
                {deck.name}
              </ThemedText>
              {deck.thumbnail ? (
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <Animated.Image
                    source={{ uri: deck.thumbnail }}
                    style={{ width: 180, height: 180, borderRadius: 12 }}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
              <ThemedText
                type="subtitle"
                style={{ marginBottom: 8 }}
              >
                Cards in this deck:
              </ThemedText>
              {/* You can parse and render deck.cards here as a list of cards */}
              <ThemedText>{deck.cards}</ThemedText>
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
