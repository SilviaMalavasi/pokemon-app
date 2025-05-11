import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import ThemedView from "@/components/base/ThemedView";
import styles from "@/style/deckbuilder/AddCardToDeckStyle";
import ThemedText from "../base/ThemedText";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import ThemedModal from "@/components/base/ThemedModal";
import { theme } from "@/style/ui/Theme";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";

interface AddCardToDeckProps {
  deck: any;
  db: any;
  onCardAdded?: () => void;
}

export default function AddCardToDeck({ deck, db, onCardAdded }: AddCardToDeckProps) {
  const { incrementDecksVersion } = useUserDatabase();
  const { db: cardDb } = useCardDatabase();
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [selectedCardName, setSelectedCardName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [stagedQty, setStagedQty] = useState<number>(1);

  // Helper to parse deck.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(deck?.cards) ? deck.cards : JSON.parse(deck?.cards || "[]");
    } catch {
      return [];
    }
  };

  // Save card to deck
  const handleSaveCard = async (quantity: number) => {
    if (!db || !deck || !selectedCardId || quantity < 1) return;
    setIsSaving(true);
    try {
      const cardsArr = getCardsArray();
      const filtered = cardsArr.filter((c: any) => c.cardId !== selectedCardId);
      const clampedQty = Math.min(Number(quantity), 4);
      filtered.push({ cardId: selectedCardId, quantity: clampedQty });
      await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(filtered), deck.id]);
      incrementDecksVersion();
      if (onCardAdded) onCardAdded();
      setSelectedCardId("");
      setSelectedCardName("");
      setResetCounter((c) => c + 1);
    } catch (e) {
      console.error("Error saving card to deck:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // When a card is selected, open the modal for quantity selection
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
    // Check if card is already in deck and set its quantity as default
    const cardsArr = getCardsArray();
    const existing = cardsArr.find((c: any) => c.cardId === cardId);
    setStagedQty(existing ? existing.quantity : 1);
    setModalVisible(true);
  };

  const handleQtyChange = (qty: number) => {
    setStagedQty(qty);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    handleSaveCard(stagedQty);
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
        <CardAutoCompleteSuggestions onCardSelect={handleCardSelect} />
        <ThemedView style={styles.row}>
          <View style={styles.cardInput}>
            <CardAutoCompleteInput
              key={`card-input-${resetCounter}`}
              label="Card"
              value={selectedCardId}
              onCardSelect={handleCardSelect}
              placeholder="Type card name (min 3 chars)"
              maxChars={25}
              resetKey={resetCounter}
            />
          </View>
        </ThemedView>
      </CardAutoCompleteProvider>

      <ThemedModal
        visible={modalVisible}
        onClose={handleConfirm}
        buttonText="Add to deck"
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setModalVisible(false)}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Set Quantity for <ThemedText color={theme.colors.textHilight}>{selectedCardName}</ThemedText>
        </ThemedText>
        <ThemedView style={styles.numbersModalContainer}>
          {[1, 2, 3, 4].map((qty) => (
            <TouchableOpacity
              key={qty}
              onPress={() => handleQtyChange(qty)}
              style={[
                {
                  backgroundColor: stagedQty === qty ? theme.colors.green : theme.colors.lightBackground,
                },
                styles.numbersModal,
              ]}
            >
              <ThemedText
                style={{ color: stagedQty === qty ? theme.colors.background : theme.colors.text, fontWeight: "bold" }}
              >
                {qty}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedModal>
    </View>
  );
}
