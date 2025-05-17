import React from "react";
import { View, TouchableOpacity } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import CompactCard from "@/components/CompactCard";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import styles from "@/style/deckbuilder/WatchlistThumbnailListStyle";
import { theme } from "@/style/ui/Theme";

interface WatchlistThumbnailListProps {
  cards: Array<{ cardId: string; name?: string; imagesLarge?: string; supertype?: string }>;
  watchlistId: number;
  db: any;
  onCardsChanged?: () => void;
}

// This component displays deck cards as thumbnails, similar to SearchResult, but with quantity overlay
export default function WatchlistThumbnailList({
  cards,
  watchlistId,
  db,
  onCardsChanged,
}: WatchlistThumbnailListProps) {
  const { db: cardDb } = useCardDatabase();
  const [cardDataMap, setCardDataMap] = React.useState<{ [id: string]: { name: string; supertype: string } }>({});

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

  // Delete card handler: update DB and call onCardsChanged
  const handleDeleteCard = async (cardId: string) => {
    if (!db || !watchlistId) return;
    const newCards = cards.filter((c) => c.cardId !== cardId);
    await db.runAsync("UPDATE WatchedCards SET cards = ? WHERE id = ?", [JSON.stringify(newCards), watchlistId]);
    if (onCardsChanged) onCardsChanged();
  };

  // Group cards by supertype using DB data
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
          {groupName} ({groupCards.length})
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
              {/* Overlay delete button in top right */}
              <TouchableOpacity
                onPress={() => handleDeleteCard(item.cardId)}
                accessibilityLabel="Remove card"
                style={styles.numberButton}
              >
                <View style={styles.button}>
                  <View style={styles.iconContainerStyle}>
                    <ThemedText style={styles.numberStyle}>×</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </React.Fragment>
    );
  };

  // Always call all hooks, render empty state in returned JSX
  return (
    <View>
      {cards.length === 0 ? (
        <ThemedText>No cards in this watchlist.</ThemedText>
      ) : (
        (["Pokémon", "Trainer", "Energy"] as const).map((group, idx) => renderGroup(group, grouped[group], idx))
      )}
    </View>
  );
}
