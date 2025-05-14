import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/deckbuilder/DeckCardListStyle";
import { Svg, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/style/ui/Theme";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";

interface DeckCardListProps {
  cards: any[];
  deckId: number;
  onCardsChanged?: () => void;
}

const DeckCardList: React.FC<DeckCardListProps> = ({ cards, deckId, onCardsChanged }) => {
  const { db } = useCardDatabase();
  const { db: userDb, decksVersion } = useUserDatabase();
  const [cardNames, setCardNames] = useState<{ [id: string]: string }>({});
  const [cardDataMap, setCardDataMap] = useState<{ [id: string]: { name: string; supertype: string } }>({});

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
      const results = await db.getAllAsync<{ cardId: string; name: string; supertype: string }>(
        `SELECT cardId, name, supertype FROM Card WHERE cardId IN (${placeholders})`,
        ids
      );
      const nameMap: { [id: string]: string } = {};
      const dataMap: { [id: string]: { name: string; supertype: string } } = {};
      results.forEach((row) => {
        nameMap[row.cardId] = row.name;
        dataMap[row.cardId] = { name: row.name, supertype: row.supertype };
      });
      setCardNames(nameMap);
      setCardDataMap(dataMap);
    };
    fetchData();
  }, [db, cards, decksVersion]);

  // Group cards by supertype (handle string or JSON array)
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
        // Only remove if not basic energy, otherwise keep at 1
        if (!isBasicEnergy) {
          cardsArr.splice(idx, 1);
        } else {
          cardsArr[idx].quantity = 1;
        }
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
    return <ThemedText>No cards in this deck.</ThemedText>;
  }

  const renderGroup = (groupName: string, groupCards: any[]) => {
    if (!groupCards.length) return null;
    return (
      <View
        style={styles.summaryContainer}
        key={groupName}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0)", theme.colors.background, theme.colors.background]}
          locations={[0, 0.4, 0.4, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.summaryLabel}
        >
          <ThemedText type="label">{`${groupName} (${groupCards.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          )})`}</ThemedText>
        </LinearGradient>
        {groupCards.map((item, idx) => (
          <View
            style={styles.summaryItemContainer}
            key={item.cardId || item.id || idx}
          >
            <View style={styles.summaryDotCol}>
              <Svg
                height={theme.padding.xsmall}
                width={theme.padding.xsmall}
              >
                <Circle
                  cx={3}
                  cy={3}
                  r={3}
                  fill={theme.colors.green}
                />
              </Svg>
            </View>
            <View style={styles.summaryitemQuantity}>
              <ThemedText color={theme.colors.textHilight}>{item.quantity || 1}</ThemedText>
            </View>
            <View style={styles.summaryTextCol}>
              <ThemedText>
                {cardDataMap[item.cardId]?.name}{" "}
                <ThemedText
                  type="hintText"
                  style={styles.cardId}
                >
                  {item.cardId}
                </ThemedText>
              </ThemedText>
              <View style={styles.qtyCol}>
                <TouchableOpacity onPress={() => handleChangeQuantity(item.cardId, "dec")}>
                  <ThemedText style={styles.qtyOperator}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText> </ThemedText>
                <TouchableOpacity onPress={() => handleChangeQuantity(item.cardId, "inc")}>
                  <ThemedText style={styles.qtyOperator}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      {renderGroup("Pokémon", grouped["Pokémon"])}
      {renderGroup("Trainer", grouped["Trainer"])}
      {renderGroup("Energy", grouped["Energy"])}
    </>
  );
};

export default DeckCardList;
