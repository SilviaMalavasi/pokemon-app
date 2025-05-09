import React, { useState } from "react";
import { View } from "react-native";
import { Svg, Path } from "react-native-svg";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import CompactCard from "@/components/CompactCard";
import styles from "@/style/deckbuilder/DeckThumbnailListStyle";
import { TouchableOpacity } from "react-native";
import ThemedModal from "@/components/base/ThemedModal";
import { theme } from "@/style/ui/Theme";

interface DeckThumbnailListProps {
  cards: Array<{ cardId: string; quantity: number; name?: string; imagesLarge?: string }>;
  deckId: number;
  onCardsChanged?: () => void;
}

// This component displays deck cards as thumbnails, similar to SearchResult, but with quantity overlay
export default function DeckThumbnailList({ cards, deckId, onCardsChanged }: DeckThumbnailListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [stagedQty, setStagedQty] = useState(1);
  const { db } = require("@/components/context/UserDatabaseContext").useUserDatabase();

  if (!cards || cards.length === 0) {
    return <ThemedText>No cards in this deck.</ThemedText>;
  }

  const handleQtyPress = (card: any) => {
    setSelectedCard(card);
    setStagedQty(card.quantity || 1);
    setModalVisible(true);
  };

  const handleQtyChange = (qty: number) => {
    setStagedQty(qty);
  };

  const handleConfirm = async () => {
    if (!db || !selectedCard) return;
    let cardsArr = [...cards];
    if (stagedQty === 0) {
      cardsArr = cardsArr.filter((c) => c.cardId !== selectedCard.cardId);
    } else {
      cardsArr = cardsArr.map((c) => (c.cardId === selectedCard.cardId ? { ...c, quantity: stagedQty } : c));
    }
    await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(cardsArr), deckId]);
    setModalVisible(false);
    setSelectedCard(null);
    if (onCardsChanged) onCardsChanged();
  };

  return (
    <ThemedView style={{ backgroundColor: "transparent" }}>
      <ThemedView style={styles.cardList}>
        {cards.map((item, idx) => (
          <ThemedView
            key={item.cardId || idx}
            style={{ position: "relative" }}
          >
            <CompactCard
              card={{ cardId: item.cardId, name: item.name || item.cardId, imagesLarge: item.imagesLarge || "" }}
            />
            <TouchableOpacity
              onPress={() => handleQtyPress(item)}
              accessibilityLabel="Change number"
              style={styles.numberButton}
            >
              <View style={styles.button}>
                <View style={styles.iconContainerStyle}>
                  <ThemedText style={styles.numberStyle}>{item.quantity}</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ThemedView>
      {/* Modal for quantity selection */}
      <ThemedModal
        visible={modalVisible}
        onClose={handleConfirm}
        buttonText="Confirm"
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setModalVisible(false)}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Set Quantity for{" "}
          <ThemedText color={theme.colors.textHilight}>{selectedCard?.name || selectedCard?.cardId}</ThemedText>
        </ThemedText>
        <ThemedView style={styles.numbersModalContainer}>
          {[0, 1, 2, 3, 4].map((qty) => (
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
    </ThemedView>
  );
}
