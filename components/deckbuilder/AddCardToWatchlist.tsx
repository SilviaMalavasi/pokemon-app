import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import ThemedView from "@/components/ui/ThemedView";
import ThemedText from "../base/ThemedText";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import styles from "@/style/deckbuilder/AddCardToWatchlistStyle";
import { theme } from "@/style/ui/Theme";

interface AddCardToWatchlistProps {
  watchlist: any;
  db: any;
  onCardAdded?: () => void;
}

export default function AddCardToWatchlist({ watchlist, db, onCardAdded }: AddCardToWatchlistProps) {
  const { incrementDecksVersion, db: userDb, isLoading, error } = useUserDatabase();
  // Defensive: Wait for both db and isLoading to be ready before any DB access
  if (isLoading || !userDb) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={theme.colors.purple}
        />
      </View>
    );
  }

  const { db: cardDb } = useCardDatabase();
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [selectedCardName, setSelectedCardName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  // Helper to parse watchlist.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(watchlist?.cards) ? watchlist.cards : JSON.parse(watchlist?.cards || "[]");
    } catch {
      return [];
    }
  };

  // Save card to watchlist (only 1 per card)
  const handleSaveCard = async (cardId: string) => {
    if (!db || !watchlist || !cardId) return;
    setIsSaving(true);
    try {
      const cardsArr = getCardsArray();
      // Only add if not already present
      if (!cardsArr.some((c: any) => c.cardId === cardId)) {
        cardsArr.push({ cardId });
        await db.runAsync("UPDATE WatchedCards SET cards = ? WHERE id = ?", [JSON.stringify(cardsArr), watchlist.id]);
        incrementDecksVersion();
        if (onCardAdded) onCardAdded();
      }
      setSelectedCardId("");
      setSelectedCardName("");
      setResetCounter((c) => c + 1);
    } catch (e) {
      console.error("Error saving card to watchlist:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // When a card is selected, add it directly to the watchlist
  const handleCardSelect = async (cardId: string) => {
    setSelectedCardId(cardId);
    let cardName = cardId;
    if (cardDb) {
      try {
        const card = await cardDb.getFirstAsync?.("SELECT name FROM Card WHERE cardId = ?", [cardId]);
        if (card && typeof card === "object" && "name" in card) cardName = (card as { name: string }).name;
      } catch {}
    }
    setSelectedCardName(cardName);
    await handleSaveCard(cardId);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="h2"
        style={styles.title}
      >
        Add Cards to Watchlist
      </ThemedText>
      <CardAutoCompleteProvider>
        <CardAutoCompleteSuggestions onCardSelect={handleCardSelect} />
        <View style={styles.cardInput}>
          <CardAutoCompleteInput
            key={`card-input-${resetCounter}`}
            value={selectedCardId}
            onCardSelect={handleCardSelect}
            placeholder="Type card name (min 3 chars)"
            maxChars={25}
            resetKey={resetCounter}
          />
        </View>
      </CardAutoCompleteProvider>
    </ThemedView>
  );
}
