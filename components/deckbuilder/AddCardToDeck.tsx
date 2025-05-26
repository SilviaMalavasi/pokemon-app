import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "../base/ThemedText";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import ThemedModal from "@/components/base/ThemedModal";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import styles from "@/style/deckbuilder/AddCardToDeckStyle";
import { theme } from "@/style/ui/Theme";
import ThemedButton from "@/components/base/ThemedButton";

interface AddCardToDeckProps {
  deck: any;
  db: any;
  onCardAdded?: () => void;
}

export default function AddCardToDeck({ deck, db, onCardAdded }: AddCardToDeckProps) {
  const { incrementDecksVersion, db: userDb, isLoading, error } = useUserDatabase();
  const { db: cardDb } = useCardDatabase();
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
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [selectedCardName, setSelectedCardName] = useState<string>("");
  const [selectedCardSupertype, setSelectedCardSupertype] = useState<string>("");
  const [selectedCardSubtypes, setSelectedCardSubtypes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [stagedQty, setStagedQty] = useState<number>(1);
  const [buttonGroupHeight, setButtonGroupHeight] = useState<number | undefined>(undefined);

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
    <ThemedView style={styles.container}>
      <ThemedText
        type="h2"
        style={styles.title}
      >
        Add Cards
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

      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        buttonText="Set in deck"
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setModalVisible(false)}
        onConfirm={handleConfirm}
        contentStyle={buttonGroupHeight ? { minHeight: buttonGroupHeight + 160 } : undefined} // 160 for header/buttons padding
      >
        <ThemedText
          type="h4"
          style={{ paddingVertical: theme.padding.medium, textAlign: "center" }}
        >
          Set Quantity for{" "}
          <ThemedText
            type="h4"
            color={theme.colors.green}
          >
            {selectedCardName}
          </ThemedText>
        </ThemedText>
        <View style={styles.numbersModalContainer}>
          {isBasicEnergy ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <ThemedButton
                title="-"
                type="outline"
                size="large"
                onPress={() => setStagedQty((q) => Math.max(1, q - 1))}
                style={[styles.numbersModal, { paddingBottom: theme.padding.xsmall }]}
                disabled={stagedQty === 1}
                accessibilityLabel="Decrease quantity"
              />
              <ThemedText style={styles.energyNumber}>{stagedQty}</ThemedText>
              <ThemedButton
                title="+"
                type="outline"
                size="large"
                onPress={() => setStagedQty((q) => q + 1)}
                style={[styles.numbersModal, { paddingBottom: theme.padding.xsmall }]}
                accessibilityLabel="Increase quantity"
              />
            </View>
          ) : (
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", width: "100%" }}
              onLayout={(e) => setButtonGroupHeight(e.nativeEvent.layout.height)}
            >
              {[1, 2, 3, 4].map((qty) => (
                <ThemedButton
                  key={qty}
                  title={qty.toString()}
                  type={"outline"}
                  size="large"
                  onPress={() => handleQtyChange(qty)}
                  style={stagedQty === qty ? styles.numbersModalActive : styles.numbersModal}
                  accessibilityLabel={`Set quantity to ${qty}`}
                />
              ))}
            </View>
          )}
        </View>
      </ThemedModal>
    </ThemedView>
  );
}
