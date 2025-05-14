import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
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
  const [selectedCardSupertype, setSelectedCardSupertype] = useState<string>("");
  const [selectedCardSubtypes, setSelectedCardSubtypes] = useState<string[]>([]);
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
      // Recalculate isBasicEnergy at save time
      const isBasicEnergy = selectedCardSupertype === "Energy" && selectedCardSubtypes.includes("Basic");
      let clampedQty = quantity;
      if (!isBasicEnergy) clampedQty = Math.min(Number(quantity), 4);
      filtered.push({ cardId: selectedCardId, quantity: clampedQty });
      await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(filtered), deck.id]);
      incrementDecksVersion();
      if (onCardAdded) onCardAdded();
      setSelectedCardId("");
      setSelectedCardName("");
      setSelectedCardSupertype("");
      setSelectedCardSubtypes([]);
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
    let supertype = "";
    let subtypes: string[] = [];
    if (cardDb) {
      try {
        const card = await cardDb.getFirstAsync?.("SELECT name, supertype, subtypes FROM Card WHERE cardId = ?", [
          cardId,
        ]);
        if (card && typeof card === "object") {
          if ("name" in card) cardName = (card as { name: string }).name;
          if ("supertype" in card) supertype = (card as { supertype: string }).supertype;
          if ("subtypes" in card) {
            try {
              let raw = card.subtypes;
              if (typeof raw === "string") {
                const parsed = JSON.parse(raw || "[]");
                if (Array.isArray(parsed)) subtypes = parsed;
              } else if (Array.isArray(raw)) {
                subtypes = raw;
              } else {
                subtypes = [];
              }
            } catch {
              subtypes = [];
            }
          }
        }
      } catch {}
    }
    setSelectedCardName(cardName);
    setSelectedCardSupertype(supertype);
    setSelectedCardSubtypes(subtypes);
    // Check if card is already in deck and set its quantity as default
    const cardsArr = getCardsArray();
    const existing = cardsArr.find((c: any) => c.cardId === cardId);
    // If Basic Energy, default to 5 or existing
    if (supertype === "Energy" && subtypes.includes("Basic")) {
      setStagedQty(existing ? existing.quantity : 1);
    } else {
      setStagedQty(existing ? existing.quantity : 1);
    }
    setModalVisible(true);
  };

  const handleQtyChange = (qty: number) => {
    setStagedQty(qty);
  };

  const isBasicEnergy = selectedCardSupertype === "Energy" && selectedCardSubtypes.includes("Basic");

  const handleConfirm = () => {
    handleSaveCard(stagedQty);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ThemedText
        type="h2"
        style={styles.title}
      >
        Add Cards
      </ThemedText>
      <CardAutoCompleteProvider>
        <CardAutoCompleteSuggestions onCardSelect={handleCardSelect} />
        <View style={styles.row}>
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
        </View>
      </CardAutoCompleteProvider>

      <ThemedModal
        visible={modalVisible}
        onClose={handleConfirm}
        buttonText="Set in deck"
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setModalVisible(false)}
      >
        <ThemedText
          type="h4"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Set Quantity for <ThemedText color={theme.colors.green}>{selectedCardName}</ThemedText>
        </ThemedText>
        <View style={styles.numbersModalContainer}>
          {isBasicEnergy ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <TouchableOpacity
                onPress={() => setStagedQty((q) => Math.max(1, q - 1))}
                style={[styles.numbersModal, { marginRight: 8 }]}
                disabled={stagedQty === 1}
              >
                <ThemedText
                  type="h4"
                  style={{ color: stagedQty === 1 ? theme.colors.grey : theme.colors.grey }}
                >
                  -
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={{ marginHorizontal: 12, fontWeight: "bold", fontSize: 20 }}>{stagedQty}</ThemedText>
              <TouchableOpacity
                onPress={() => setStagedQty((q) => q + 1)}
                style={[styles.numbersModal, { marginLeft: 8 }]}
              >
                <ThemedText type="h4">+</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            [1, 2, 3, 4].map((qty) => (
              <TouchableOpacity
                key={qty}
                onPress={() => handleQtyChange(qty)}
                style={[
                  {
                    backgroundColor: stagedQty === qty ? theme.colors.green : theme.colors.mediumGrey,
                  },
                  styles.numbersModal,
                ]}
              >
                <ThemedText
                  style={{ color: stagedQty === qty ? theme.colors.background : theme.colors.grey, fontWeight: "bold" }}
                >
                  {qty}
                </ThemedText>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ThemedModal>
    </View>
  );
}
