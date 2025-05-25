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
import { orderCardsInDeck } from "@/helpers/orderCardsInDeck";
import { useRouter } from "expo-router";

interface DeckThumbnailListProps {
  cards: Array<{ cardId: string; quantity: number; name?: string; imagesLarge?: string; supertype?: string }>;
  deckId: number;
  onCardsChanged?: () => void;
}

export default function DeckThumbnailList({ cards, deckId, onCardsChanged }: DeckThumbnailListProps) {
  const {
    db: userDb,
    isLoading,
    error,
    incrementDecksVersion,
  } = require("@/components/context/UserDatabaseContext").useUserDatabase();
  const { db: cardDb } = useCardDatabase();
  const router = useRouter();
  // Always call all hooks, even if DB is not ready
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [stagedQty, setStagedQty] = useState(1);
  const [buttonGroupHeight, setButtonGroupHeight] = useState<number | undefined>(undefined);
  // Add subtypes to cardDataMap for sorting
  const [cardDataMap, setCardDataMap] = useState<{
    [id: string]: { name: string; supertype: string; subtypes: string[] };
  }>({});
  const [selectedCardSupertype, setSelectedCardSupertype] = useState<string>("");
  const [selectedCardSubtypes, setSelectedCardSubtypes] = useState<string[]>([]);

  // Group cards by supertype using DB data (like DeckCardList)
  // Build a cardDbMap for fast lookup of evolvesFrom/evolvesTo
  const [cardDbMap, setCardDbMap] = useState<any>({});
  React.useEffect(() => {
    if (!cardDb) return;
    // Preload all evolvesFrom/evolvesTo for all cards in the deck
    (async () => {
      const map: any = {};
      for (const card of cards) {
        try {
          const dbCard = await cardDb.getFirstAsync?.("SELECT evolvesFrom, evolvesTo FROM Card WHERE cardId = ?", [
            card.cardId,
          ]);
          map[card.cardId] = dbCard || {};
        } catch {
          map[card.cardId] = {};
        }
      }
      setCardDbMap(map);
    })();
  }, [cardDb, cards]);

  const grouped = React.useMemo(() => orderCardsInDeck(cards, cardDataMap, cardDbMap), [cards, cardDataMap, cardDbMap]);

  // Fetch card data for all cards in the deck and populate cardDataMap
  React.useEffect(() => {
    let isMounted = true;
    async function fetchCardData() {
      if (!cardDb || !cards || cards.length === 0) return;
      const newMap: { [id: string]: { name: string; supertype: string; subtypes: string[] } } = {};
      for (const card of cards) {
        try {
          const dbCard = await cardDb.getFirstAsync?.("SELECT name, supertype, subtypes FROM Card WHERE cardId = ?", [
            card.cardId,
          ]);
          const dbName = dbCard && typeof dbCard === "object" && "name" in dbCard ? (dbCard as any).name : undefined;
          const dbSupertype =
            dbCard && typeof dbCard === "object" && "supertype" in dbCard ? (dbCard as any).supertype : undefined;
          let dbSubtypes: string[] = [];
          if (dbCard && typeof dbCard === "object" && "subtypes" in dbCard) {
            const raw = (dbCard as any).subtypes;
            if (typeof raw === "string") {
              try {
                const parsed = JSON.parse(raw || "[]");
                if (Array.isArray(parsed)) dbSubtypes = parsed;
                else if (parsed) dbSubtypes = [parsed];
              } catch {
                if (raw.trim() !== "") dbSubtypes = [raw];
              }
            } else if (Array.isArray(raw)) {
              dbSubtypes = raw;
            }
          }
          newMap[card.cardId] = {
            name: dbName || card.name || card.cardId,
            supertype: dbSupertype || card.supertype || "",
            subtypes: dbSubtypes,
          };
        } catch {
          newMap[card.cardId] = {
            name: card.name || card.cardId,
            supertype: card.supertype || "",
            subtypes: [],
          };
        }
      }
      if (isMounted) setCardDataMap(newMap);
    }
    fetchCardData();
    return () => {
      isMounted = false;
    };
  }, [cardDb, cards]);

  // Render loading or error state if needed
  if (isLoading || !userDb || !cardDb) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={theme.colors.purple}
        />
      </View>
    );
  }
  // Use userDb for all user DB operations
  const db = userDb;

  if (!cards || cards.length === 0) {
    return <ThemedText style={{ paddingVertical: theme.padding.medium }}>No cards in this deck.</ThemedText>;
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
    if (typeof incrementDecksVersion === "function") incrementDecksVersion();
  };

  // Helper to render a flat group (Trainer or Energy)
  const renderFlatGroup = (groupName: string, groupCards: any[], index: number) => {
    if (!groupCards || groupCards.length === 0) return null;
    return (
      <React.Fragment key={groupName}>
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
            <TouchableOpacity
              key={item.cardId || idx}
              style={{ position: "relative" }}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/cards/[cardId]",
                  params: { cardId: item.cardId, deckId: deckId, from: "deckDetail" },
                })
              }
              accessibilityLabel={`View details for ${item.name || item.cardId}`}
              accessibilityRole="button"
            >
              <CompactCard
                card={{ cardId: item.cardId, name: item.name || item.cardId, imagesLarge: item.imagesLarge || "" }}
                disableLink={true}
              />
              <TouchableOpacity
                onPress={(e) => {
                  if (e && typeof e.stopPropagation === "function") e.stopPropagation();
                  handleQtyPress(item);
                }}
                accessibilityLabel="Change number"
                accessibilityRole="button"
                style={styles.numberButton}
              >
                <View style={styles.button}>
                  <View style={styles.iconContainerStyle}>
                    <ThemedText style={styles.numberStyle}>{item.quantity}</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </React.Fragment>
    );
  };

  // Helper to render Pokémon group (flat, not by evolution line)
  const renderPokemonGroup = (groupCards: any[], index: number) => {
    if (!groupCards || groupCards.length === 0) return null;
    return (
      <React.Fragment key="Pokémon">
        <ThemedText
          type="h4"
          style={{
            marginTop: index > 0 ? theme.padding.large : theme.padding.small,
            marginBottom: theme.padding.medium,
          }}
        >
          Pokémon ({groupCards.reduce((sum, item) => sum + (item.quantity || 1), 0)})
        </ThemedText>
        <View style={styles.cardList}>
          {groupCards.map((item, idx) => (
            <TouchableOpacity
              key={item.cardId || idx}
              style={{ position: "relative" }}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/cards/[cardId]",
                  params: { cardId: item.cardId, deckId: deckId, from: "deckDetail" },
                })
              }
              accessibilityLabel={`View details for ${item.name || item.cardId}`}
              accessibilityRole="button"
            >
              <CompactCard
                card={{ cardId: item.cardId, name: item.name || item.cardId, imagesLarge: item.imagesLarge || "" }}
                disableLink={true}
              />
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleQtyPress(item);
                }}
                accessibilityLabel="Change number"
                accessibilityRole="button"
                style={styles.numberButton}
              >
                <View style={styles.button}>
                  <View style={styles.iconContainerStyle}>
                    <ThemedText style={styles.numberStyle}>{item.quantity}</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </React.Fragment>
    );
  };

  return (
    <View>
      {renderPokemonGroup(grouped["Pokémon"], 0)}
      {renderFlatGroup("Trainer", grouped["Trainer"], 1)}
      {renderFlatGroup("Energy", grouped["Energy"], 2)}
      {/* Modal for quantity selection */}
      <ThemedModal
        visible={modalVisible}
        onClose={handleConfirm}
        buttonText="Confirm"
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setModalVisible(false)}
        contentStyle={buttonGroupHeight ? { minHeight: buttonGroupHeight + 120 } : undefined}
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
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", width: "100%" }}
              onLayout={(e) => setButtonGroupHeight(e.nativeEvent.layout.height)}
            >
              {[0, 1, 2, 3, 4].map((qty) => (
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
              ))}
            </View>
          )}
        </View>
      </ThemedModal>
    </View>
  );
}
