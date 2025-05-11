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
import { useCardDatabase } from "@/components/context/CardDatabaseContext";

interface DeckThumbnailListProps {
  cards: Array<{ cardId: string; quantity: number; name?: string; imagesLarge?: string; supertype?: string }>;
  deckId: number;
  onCardsChanged?: () => void;
}

// This component displays deck cards as thumbnails, similar to SearchResult, but with quantity overlay
export default function DeckThumbnailList({ cards, deckId, onCardsChanged }: DeckThumbnailListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [stagedQty, setStagedQty] = useState(1);
  const { db } = require("@/components/context/UserDatabaseContext").useUserDatabase();
  const { db: cardDb } = useCardDatabase();
  const [cardDataMap, setCardDataMap] = useState<{ [id: string]: { name: string; supertype: string } }>({});

  React.useEffect(() => {
    if (!cardDb || !cards || cards.length === 0) {
      setCardDataMap({});
      return;
    }
    const fetchData = async () => {
      const ids = cards.map((c) => c.cardId).filter(Boolean);
      if (!ids.length) return;
      const placeholders = ids.map(() => "?").join(", ");
      const results = await cardDb.getAllAsync?.<{ cardId: string; name: string; supertype: string }>(
        `SELECT cardId, name, supertype FROM Card WHERE cardId IN (${placeholders})`,
        ids
      );
      const dataMap: { [id: string]: { name: string; supertype: string } } = {};
      results?.forEach((row) => {
        dataMap[row.cardId] = { name: row.name, supertype: row.supertype };
      });
      setCardDataMap(dataMap);
    };
    fetchData();
  }, [cardDb, cards]);

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

  // Group cards by supertype using DB data (like DeckCardList)
  const grouped = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {
      Pokémon: [],
      Trainer: [],
      Energy: [],
    };
    (cards || []).forEach((card) => {
      const dbData = cardDataMap[card.cardId];
      let supertype: string | undefined = undefined;
      if (dbData) {
        if (Array.isArray(dbData.supertype)) {
          supertype = dbData.supertype[0];
        } else if (typeof dbData.supertype === "string") {
          try {
            const arr = JSON.parse(dbData.supertype);
            if (Array.isArray(arr) && arr.length > 0) {
              supertype = arr[0];
            } else {
              supertype = dbData.supertype;
            }
          } catch {
            supertype = dbData.supertype;
          }
        }
      }
      if (supertype === "Pokémon") groups["Pokémon"].push(card);
      else if (supertype === "Trainer") groups["Trainer"].push(card);
      else if (supertype === "Energy") groups["Energy"].push(card);
      // Ignore others
    });
    return groups;
  }, [cards, cardDataMap]);

  const renderGroup = (groupName: string, groupCards: any[], index: number) => {
    // Always render the group title, even if the group is not the first and follows another group
    // Only skip rendering if the group is empty
    if (!groupCards || groupCards.length === 0) return null;
    return (
      <React.Fragment key={groupName}>
        {/* Add extra margin if not the first group and previous group is not empty */}
        <ThemedText
          type="defaultSemiBold"
          style={{ marginTop: index > 0 ? theme.padding.large : 0, marginBottom: theme.padding.xsmall }}
        >
          {groupName} ({groupCards.reduce((sum, item) => sum + (item.quantity || 1), 0)})
        </ThemedText>
        <ThemedView style={styles.cardList}>
          {groupCards.map((item, idx) => (
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
      </React.Fragment>
    );
  };

  return (
    <ThemedView style={{ backgroundColor: "transparent" }}>
      {(["Pokémon", "Trainer", "Energy"] as const).map((group, idx) => renderGroup(group, grouped[group], idx))}
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
