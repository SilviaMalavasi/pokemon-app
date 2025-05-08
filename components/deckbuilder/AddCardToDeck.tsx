import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import ThemedNumberInput from "@/components/base/ThemedNumberInput";
import ThemedView from "@/components/base/ThemedView";
import { Svg, Path, Polygon } from "react-native-svg";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/deckbuilder/AddCardToDeckStyle";

interface AddCardToDeckProps {
  deck: any;
  db: any;
  onCardAdded?: () => void;
}

export default function AddCardToDeck({ deck, db, onCardAdded }: AddCardToDeckProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [cardQuantity, setCardQuantity] = useState<number | "">(1);
  const [isSaving, setIsSaving] = useState(false);

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
      setCardQuantity(1);
    } catch (e) {
      console.error("Error saving card to deck:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CardAutoCompleteProvider>
      <CardAutoCompleteSuggestions onCardSelect={setSelectedCardId} />
      <ThemedView style={styles.row}>
        <View style={styles.cardInput}>
          <CardAutoCompleteInput
            label="Card"
            value={selectedCardId}
            onCardSelect={setSelectedCardId}
            placeholder="Type card name"
          />
        </View>
        <View style={styles.numberInput}>
          <ThemedNumberInput
            label="Qty"
            value={cardQuantity}
            onChange={(val) => setCardQuantity(val)}
            placeholder="1"
            showOperatorSelect="none"
          />
        </View>
        <TouchableOpacity
          onPress={handleSaveCard}
          disabled={!selectedCardId || !cardQuantity || isSaving}
          style={[styles.saveButton, (!selectedCardId || !cardQuantity || isSaving) && styles.saveButtonDisabled]}
          accessibilityLabel="Add card to deck"
        >
          <View style={styles.iconContainerStyle}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 326.06 326.06"
            >
              <Polygon points="306.5 119.6 206.46 119.6 206.46 19.56 119.6 19.56 119.6 119.6 19.56 119.6 19.56 206.46 119.6 206.46 119.6 306.5 206.46 306.5 206.46 206.46 306.5 206.46 306.5 119.6" />
              <Path
                d="M192.38,20v113.68h113.68v58.7h-113.68v113.68h-58.7v-113.68H20v-58.7h113.68V20h58.7m-.32-20h-58.38c-11.05,0-20,8.95-20,20V113.68H20c-11.05,0-20,8.95-20,20v58.7c0,11.05,8.95,20,20,20H113.68v93.68c0,11.05,8.95,20,20,20h58.7c11.05,0,20-8.95,20-20v-93.68h93.68c11.05,0,20-8.95,20-20v-58.7c0-11.05-8.95-20-20-20h-93.68V20c0-11.67-9.09-20-20.32-20Z"
                fill="#fff"
              />
            </Svg>
          </View>
        </TouchableOpacity>
      </ThemedView>
    </CardAutoCompleteProvider>
  );
}
