import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import FloatingButton from "@/components/ui/FloatingButton";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AddCardToDeck from "@/components/deckbuilder/AddCardToDeck";
import DeckCardList from "@/components/deckbuilder/DeckCardList";
import { theme } from "@/style/ui/Theme";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import FloatingEdit from "@/components/ui/FloatingEdit";
import DeckThumbnailList from "@/components/deckbuilder/DeckThumbnailList";
import { View } from "react-native";

export default function DeckScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const [deck, setDeck] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const router = useRouter();
  const { db, isLoading: dbLoading, error, decksVersion } = useUserDatabase();
  const { db: cardDb } = useCardDatabase();
  const [viewMode, setViewMode] = useState<"list" | "thumbnails">("list");
  const [cardDetails, setCardDetails] = useState<any[]>([]);

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
  }, [deckId, db, decksVersion]);

  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!cardDb || !deck) return setCardDetails([]);
      const cardsArr = getCardsArray();
      if (!cardsArr.length) return setCardDetails([]);
      const ids = cardsArr.map((c: any) => c.cardId).filter(Boolean);
      if (!ids.length) return setCardDetails([]);
      const placeholders = ids.map(() => "?").join(", ");
      const results = await cardDb.getAllAsync<{ cardId: string; name: string; imagesLarge: string }>(
        `SELECT cardId, name, imagesLarge FROM Card WHERE cardId IN (${placeholders})`,
        ids
      );
      // Merge quantity from deck
      const merged = cardsArr.map((c: any) => {
        const found = results.find((r: any) => r.cardId === c.cardId);
        return {
          cardId: c.cardId,
          quantity: c.quantity || 1,
          name: found?.name || c.cardId,
          imagesLarge: found?.imagesLarge || "",
        };
      });
      setCardDetails(merged);
    };
    fetchCardDetails();
  }, [deck, cardDb]);

  // Helper to parse deck.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(deck?.cards) ? deck.cards : JSON.parse(deck?.cards || "[]");
    } catch {
      return [];
    }
  };

  // Calculate total number of cards in the deck
  const totalCardCount = getCardsArray().reduce((sum: number, card: any) => sum + (card.quantity || 1), 0);

  return (
    <>
      <MainScrollView
        headerImage="deck-bkg"
        headerTitle={deck?.name || "Deck Details"}
        scrollRef={scrollRef}
      >
        <View>
          {loading || dbLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.greyAlternative}
              style={{ marginTop: 200 }}
            />
          ) : error ? (
            <ThemedText>Error loading deck: {error.message}</ThemedText>
          ) : deck ? (
            <>
              <FloatingEdit
                deck={deck}
                db={db}
                cardDb={cardDb}
                setDeck={setDeck}
                deckId={deckId}
              />
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
              {/* Toggle Button */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: theme.padding.medium,
                  marginBottom: theme.padding.large,
                }}
              >
                <ThemedText type="h2">Cards ({totalCardCount})</ThemedText>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setViewMode(viewMode === "list" ? "thumbnails" : "list")}
                  style={{
                    backgroundColor: theme.colors.mediumGrey,
                    borderWidth: 1,
                    borderColor: theme.colors.green,
                    borderRadius: theme.borderRadius.large,
                    paddingHorizontal: theme.padding.small,
                    ...theme.shadowSmall,
                  }}
                >
                  <ThemedText
                    type="chip"
                    style={{ color: theme.colors.grey, textTransform: "uppercase" }}
                  >
                    {viewMode === "list" ? "Thumb View" : "List View"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              {viewMode === "list" ? (
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
              ) : (
                <DeckThumbnailList
                  cards={cardDetails}
                  deckId={Number(deckId)}
                  onCardsChanged={async () => {
                    if (db) {
                      const updatedDeck = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
                      setDeck(updatedDeck);
                    }
                  }}
                />
              )}
            </>
          ) : (
            <ThemedText>Deck not found.</ThemedText>
          )}
        </View>
      </MainScrollView>
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
