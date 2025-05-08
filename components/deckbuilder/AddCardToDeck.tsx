import React, { useState } from "react";
import { View } from "react-native";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import ThemedNumberInput from "@/components/base/ThemedNumberInput";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import styles from "@/style/deckbuilder/AddCardToDeckStyle";
import ThemedText from "../base/ThemedText";

interface AddCardToDeckProps {
  deck: any;
  db: any;
  onCardAdded?: () => void;
}

export default function AddCardToDeck({ deck, db, onCardAdded }: AddCardToDeckProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [cardQuantity, setCardQuantity] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [resetCounter, setResetCounter] = useState(0); // Add reset counter

  // Helper to parse deck.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(deck?.cards) ? deck.cards : JSON.parse(deck?.cards || "[]");
    } catch {
      return [];
    }
  };

  // Save card to deck
  const handleSaveCard = async () => {
    if (!db || !deck || !selectedCardId || !cardQuantity || cardQuantity < 1) return;
    setIsSaving(true);
    try {
      const cardsArr = getCardsArray();
      // Remove existing entry for this cardId if present
      const filtered = cardsArr.filter((c: any) => c.cardId !== selectedCardId);
      filtered.push({ cardId: selectedCardId, quantity: cardQuantity });
      await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(filtered), deck.id]);
      if (onCardAdded) onCardAdded();
      setSelectedCardId("");
      setCardQuantity(""); // Set to empty string for true UI reset
      setResetCounter((c) => c + 1); // Increment reset counter to force remount
    } catch (e) {
      console.error("Error saving card to deck:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText
        type="subtitle"
        style={styles.title}
      >
        Add Cards
      </ThemedText>
      <CardAutoCompleteProvider>
        <CardAutoCompleteSuggestions onCardSelect={setSelectedCardId} />
        <ThemedView style={styles.row}>
          <View style={styles.cardInput}>
            <CardAutoCompleteInput
              key={`card-input-${resetCounter}`}
              label="Card"
              value={selectedCardId}
              onCardSelect={setSelectedCardId}
              placeholder="Type card name"
              resetKey={resetCounter} // Pass resetKey to force clear
            />
          </View>
          <View style={styles.numberInput}>
            <ThemedNumberInput
              key={`number-input-${resetCounter}`}
              label="Qty"
              value={cardQuantity}
              onChange={(val) => setCardQuantity(val)}
              placeholder="1"
              showOperatorSelect="none"
              resetKey={resetCounter} // Pass resetKey to force clear
            />
          </View>
          <ThemedButton
            title=""
            type="main"
            icon="add"
            status={!selectedCardId || !cardQuantity || isSaving ? "disabled" : "default"}
            disabled={!selectedCardId || !cardQuantity || isSaving}
            onPress={handleSaveCard}
            accessibilityLabel="Add card to deck"
            style={styles.saveButton}
          />
        </ThemedView>
      </CardAutoCompleteProvider>
    </View>
  );
}
