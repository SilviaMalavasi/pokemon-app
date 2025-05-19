import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/deckbuilder/DeckCardListStyle";
import { theme } from "@/style/ui/Theme";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import ThemedButton from "@/components/base/ThemedButton";
import { orderCardsInDeck } from "@/helpers/orderCardsInDeck";
import { useRouter } from "expo-router";

interface DeckCardListProps {
  cards: any[];
  deckId: number;
  onCardsChanged?: () => void;
}

const DeckCardList: React.FC<DeckCardListProps> = ({ cards, deckId, onCardsChanged }) => {
  const { db } = useCardDatabase();
  const { db: userDb, isLoading, error, decksVersion } = useUserDatabase();
  const router = useRouter();

  // Wait for userDb to be ready before rendering anything
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

  const [cardNames, setCardNames] = useState<{ [id: string]: string }>({});
  const [cardDataMap, setCardDataMap] = useState<{
    [id: string]: { name: string; supertype: string; subtypes: string[] };
  }>({});

  useEffect(() => {
    if (!db || !cards || cards.length === 0) {
      setCardNames({});
      setCardDataMap({});
      return;
    }
    const fetchData = async () => {
      const ids = cards.map((c) => c.cardId || c.id).filter(Boolean);
      if (!ids.length) return;
      const placeholders = ids.map(() => "?").join(", ");
      const results = await db.getAllAsync<{ cardId: string; name: string; supertype: string; subtypes: string }>(
        `SELECT cardId, name, supertype, subtypes FROM Card WHERE cardId IN (${placeholders})`,
        ids
      );
      const nameMap: { [id: string]: string } = {};
      const dataMap: { [id: string]: { name: string; supertype: string; subtypes: string[] } } = {};
      results.forEach((row) => {
        let subtypesArr: string[] = [];
        if (Array.isArray(row.subtypes)) {
          subtypesArr = row.subtypes;
        } else if (typeof row.subtypes === "string") {
          try {
            const arr = JSON.parse(row.subtypes);
            if (Array.isArray(arr)) subtypesArr = arr;
            else if (arr) subtypesArr = [arr];
          } catch {
            if (row.subtypes) subtypesArr = [row.subtypes];
          }
        }
        nameMap[row.cardId] = row.name;
        dataMap[row.cardId] = { name: row.name, supertype: row.supertype, subtypes: subtypesArr };
      });
      setCardNames(nameMap);
      setCardDataMap(dataMap);
    };
    fetchData();
  }, [db, cards, decksVersion]);

  // Group and sort cards by supertype and evolution using orderCardsInDeck
  const grouped = React.useMemo(() => orderCardsInDeck(cards, cardDataMap, db), [cards, cardDataMap, db]);

  // Helper to trigger quantity change and refresh UI
  const increaseCardQuantity = async (
    db: any,
    deckId: number,
    cardId: string,
    getCardSupertypeAndSubtypes: (cardId: string) => Promise<{ supertype: string; subtypes: string } | null>
  ) => {
    const deck = await db.getFirstAsync("SELECT cards FROM Decks WHERE id = ?", [deckId]);
    if (!deck) {
      console.warn(`[increaseCardQuantity] Deck not found for deckId: ${deckId}`);
      throw new Error("Deck not found");
    }
    let cardsArr: any[] = [];
    try {
      cardsArr = Array.isArray(deck.cards) ? deck.cards : JSON.parse(deck.cards || "[]");
    } catch {
      cardsArr = [];
    }
    const idx = cardsArr.findIndex((c) => c.cardId === cardId);

    // Get supertype and subtypes from card database
    const cardInfo = await getCardSupertypeAndSubtypes(cardId);
    let isBasicEnergy = false;
    if (cardInfo) {
      const { supertype, subtypes } = cardInfo;
      // subtypes can be a JSON string or array
      let subtypesArr: string[] = [];
      if (Array.isArray(subtypes)) {
        subtypesArr = subtypes;
      } else if (typeof subtypes === "string") {
        try {
          const arr = JSON.parse(subtypes);
          if (Array.isArray(arr)) subtypesArr = arr;
          else if (subtypes) subtypesArr = [subtypes];
        } catch {
          if (subtypes) subtypesArr = [subtypes];
        }
      }
      isBasicEnergy = supertype === "Energy" && subtypesArr.includes("Basic");
    }

    if (idx !== -1) {
      if (isBasicEnergy || cardsArr[idx].quantity < 4) {
        cardsArr[idx].quantity += 1;
      }
    } else {
      cardsArr.push({ cardId, quantity: 1 });
    }
    await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(cardsArr), deckId]);
  };

  // Helper to get supertype and subtypes from card database
  const getCardSupertypeAndSubtypes = async (
    cardId: string
  ): Promise<{ supertype: string; subtypes: string } | null> => {
    if (!db) return null;
    const result = await db.getFirstAsync("SELECT supertype, subtypes FROM Card WHERE cardId = ?", [cardId]);
    if (!result || typeof result !== "object" || result === null) return null;
    const r: any = result;
    if (typeof r.supertype !== "string" || typeof r.subtypes !== "string") return null;
    return { supertype: r.supertype, subtypes: r.subtypes };
  };

  // Helper to decrease card quantity in a deck (remove if 0)
  const decreaseCardQuantity = async (
    db: any,
    deckId: number,
    cardId: string,
    getCardSupertypeAndSubtypes: (cardId: string) => Promise<{ supertype: string; subtypes: string } | null>
  ) => {
    const deck = await db.getFirstAsync("SELECT cards FROM Decks WHERE id = ?", [deckId]);
    if (!deck) {
      console.warn(`[decreaseCardQuantity] Deck not found for deckId: ${deckId}`);
      throw new Error("Deck not found");
    }
    let cardsArr: any[] = [];
    try {
      cardsArr = Array.isArray(deck.cards) ? deck.cards : JSON.parse(deck.cards || "[]");
    } catch {
      cardsArr = [];
    }
    const idx = cardsArr.findIndex((c) => c.cardId === cardId);

    // Get supertype and subtypes from card database
    const cardInfo = await getCardSupertypeAndSubtypes(cardId);
    let isBasicEnergy = false;
    if (cardInfo) {
      const { supertype, subtypes } = cardInfo;
      let subtypesArr: string[] = [];
      if (Array.isArray(subtypes)) {
        subtypesArr = subtypes;
      } else if (typeof subtypes === "string") {
        try {
          const arr = JSON.parse(subtypes);
          if (Array.isArray(arr)) subtypesArr = arr;
          else if (subtypes) subtypesArr = [subtypes];
        } catch {
          if (subtypes) subtypesArr = [subtypes];
        }
      }
      isBasicEnergy = supertype === "Energy" && subtypesArr.includes("Basic");
    }

    if (idx !== -1) {
      if (cardsArr[idx].quantity > 1) {
        cardsArr[idx].quantity -= 1;
      } else {
        // Remove the card entry when quantity reaches 0, regardless of type
        cardsArr.splice(idx, 1);
      }
      await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(cardsArr), deckId]);
    }
  };

  // Helper to trigger quantity change and refresh UI
  const handleChangeQuantity = async (cardId: string, action: "inc" | "dec") => {
    if (!userDb || !deckId) {
      console.warn(`[handleChangeQuantity] Early return: userDb or deckId missing. userDb:`, userDb, "deckId:", deckId);
      return;
    }
    let newQty = 1;
    const card = cards.find((c) => c.cardId === cardId);
    if (card) newQty = card.quantity || 1;
    if (action === "inc") {
      await increaseCardQuantity(userDb, deckId, cardId, getCardSupertypeAndSubtypes);
      newQty = newQty + 1;
    } else {
      await decreaseCardQuantity(userDb, deckId, cardId, getCardSupertypeAndSubtypes);
      newQty = Math.max(0, newQty - 1);
    }
    if (onCardsChanged) onCardsChanged();
  };

  if (!cards || cards.length === 0) {
    return <ThemedText style={{ paddingVertical: theme.padding.medium }}>No cards in this deck.</ThemedText>;
  }

  const renderGroup = (groupName: string, groupCards: any[], index: number) => {
    if (!groupCards.length) return null;
    return (
      <View key={groupName}>
        <ThemedText
          type="h4"
          style={{
            marginTop: index > 0 ? theme.padding.large : theme.padding.small,
            marginBottom: theme.padding.medium,
          }}
        >
          {groupName} ({groupCards.reduce((sum, item) => sum + (item.quantity || 1), 0)})
        </ThemedText>
        {groupCards.map((item, idx) => (
          <View
            style={styles.summaryItemContainer}
            key={item.cardId || item.id || idx}
          >
            <View style={styles.summaryTextCol}>
              <View style={styles.summaryTextCardName}>
                <View style={styles.summaryTextCardNameCols}>
                  <ThemedText style={styles.summaryTextCardQtyCol}>{item.quantity || 1}</ThemedText>
                  <ThemedText
                    onPress={() =>
                      router.push({
                        pathname: "/cards/[cardId]",
                        params: { cardId: item.cardId, deckId, from: "deckDetail" },
                      })
                    }
                  >
                    {cardDataMap[item.cardId]?.name} <ThemedText style={styles.cardId}>{item.cardId}</ThemedText>
                  </ThemedText>
                </View>
              </View>
              <View style={styles.qtyCol}>
                <ThemedButton
                  title="-"
                  type="outline"
                  size="small"
                  onPress={() => handleChangeQuantity(item.cardId, "dec")}
                  style={styles.qtyOperator}
                />
                <ThemedButton
                  title="+"
                  type="outline"
                  size="small"
                  onPress={() => handleChangeQuantity(item.cardId, "inc")}
                  style={styles.qtyOperator}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      {renderGroup("Pokémon", grouped["Pokémon"], 0)}
      {renderGroup("Trainer", grouped["Trainer"], 1)}
      {renderGroup("Energy", grouped["Energy"], 2)}
    </>
  );
};

export default DeckCardList;
