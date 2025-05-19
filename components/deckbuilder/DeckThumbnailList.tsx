import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import CompactCard from "@/components/CompactCard";
import { TouchableOpacity } from "react-native";
import ThemedModal from "@/components/base/ThemedModal";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import styles from "@/style/deckbuilder/DeckThumbnailListStyle";
import { theme } from "@/style/ui/Theme";
import ThemedButton from "@/components/base/ThemedButton";

interface DeckThumbnailListProps {
  cards: Array<{ cardId: string; quantity: number; name?: string; imagesLarge?: string; supertype?: string }>;
  deckId: number;
  onCardsChanged?: () => void;
}

export default function DeckThumbnailList({ cards, deckId, onCardsChanged }: DeckThumbnailListProps) {
  const { db: userDb, isLoading, error } = require("@/components/context/UserDatabaseContext").useUserDatabase();
  // Wait for userDb to be ready before rendering anything
  if (!userDb || isLoading || error) return null;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [stagedQty, setStagedQty] = useState(1);
  // Use userDb for all user DB operations
  const db = userDb;
  const { db: cardDb } = useCardDatabase();
  const [cardDataMap, setCardDataMap] = useState<{ [id: string]: { name: string; supertype: string } }>({});
  // Add state for supertype and subtypes
  const [selectedCardSupertype, setSelectedCardSupertype] = useState<string>("");
  const [selectedCardSubtypes, setSelectedCardSubtypes] = useState<string[]>([]);

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

  // Update handleQtyPress to fetch supertype and subtypes
  const handleQtyPress = async (card: any) => {
    setSelectedCard(card);
    setStagedQty(card.quantity || 1);
    let supertype = "";
    let subtypes: string[] = [];
    if (cardDb) {
      try {
        // Use a type assertion for dbCard
        const dbCard = (await cardDb.getFirstAsync?.("SELECT supertype, subtypes FROM Card WHERE cardId = ?", [
          card.cardId,
        ])) as { supertype?: string; subtypes?: string | string[] } | undefined;
        if (dbCard && typeof dbCard === "object") {
          if (typeof dbCard.supertype === "string") {
            supertype = dbCard.supertype;
          }
          if (dbCard.subtypes !== undefined) {
            let raw = dbCard.subtypes;
            if (typeof raw === "string") {
              try {
                const parsed = JSON.parse(raw || "[]");
                if (Array.isArray(parsed)) subtypes = parsed;
                else if (parsed) subtypes = [parsed];
              } catch {
                if (raw.trim() !== "") subtypes = [raw];
              }
            } else if (Array.isArray(raw)) {
              subtypes = raw;
            }
          }
        }
      } catch {}
    }
    setSelectedCardSupertype(supertype);
    setSelectedCardSubtypes(subtypes);
    setModalVisible(true);
  };

  const handleQtyChange = (qty: number) => {
    setStagedQty(qty);
  };

  // isBasicEnergy logic
  const isBasicEnergy = selectedCardSupertype === "Energy" && selectedCardSubtypes.includes("Basic");

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
    setSelectedCardSupertype("");
    setSelectedCardSubtypes([]);
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
          type="h4"
          style={{
            marginTop: index > 0 ? theme.padding.large : theme.padding.small,
            marginBottom: theme.padding.medium,
          }}
        >
          {groupName} ({groupCards.reduce((sum, item) => sum + (item.quantity || 1), 0)})
        </ThemedText>
        <View style={styles.cardList}>
          {groupCards.map((item, idx) => (
            <View
              key={item.cardId || idx}
              style={{ position: "relative" }}
            >
              <CompactCard
                card={{ cardId: item.cardId, name: item.name || item.cardId, imagesLarge: item.imagesLarge || "" }}
                disableLink={true}
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
            </View>
          ))}
        </View>
      </React.Fragment>
    );
  };

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

  return (
    <View>
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
          type="h4"
          style={{ paddingVertical: theme.padding.medium, textAlign: "center" }}
        >
          Set Quantity for{" "}
          <ThemedText
            type="h4"
            color={theme.colors.green}
          >
            {selectedCard?.name || selectedCard?.cardId}
          </ThemedText>
        </ThemedText>
        <View style={styles.numbersModalContainer}>
          {isBasicEnergy ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <ThemedButton
                title="-"
                type="outline"
                size="large"
                onPress={() => setStagedQty((q) => Math.max(0, q - 1))}
                style={[styles.numbersModal, { paddingBottom: theme.padding.xsmall }]}
                disabled={stagedQty === 0}
              />
              <ThemedText style={{ fontSize: 22, marginHorizontal: 16, fontWeight: "bold" }}>{stagedQty}</ThemedText>
              <ThemedButton
                title="+"
                type="outline"
                size="large"
                onPress={() => setStagedQty((q) => q + 1)}
                style={[styles.numbersModal, { paddingBottom: theme.padding.xsmall }]}
              />
            </View>
          ) : (
            [0, 1, 2, 3, 4].map((qty) => (
              <ThemedButton
                key={qty}
                title={qty.toString()}
                type="outline"
                size="large"
                onPress={() => handleQtyChange(qty)}
                style={
                  stagedQty === qty
                    ? [styles.numbersModal, { backgroundColor: theme.colors.green }]
                    : styles.numbersModal
                }
              />
            ))
          )}
        </View>
      </ThemedModal>
    </View>
  );
}
