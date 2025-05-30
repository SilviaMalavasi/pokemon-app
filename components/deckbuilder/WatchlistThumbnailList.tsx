import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import CompactCard from "@/components/CompactCard";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import styles from "@/style/deckbuilder/WatchlistThumbnailListStyle";
import { theme } from "@/style/ui/Theme";
import { useRouter } from "expo-router";

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
  const [cardDataMap, setCardDataMap] = React.useState<{
    [id: string]: { name: string; supertype: string; imagesLarge: string };
  }>({});
  const router = useRouter();

  // Add loading indicator for cardDb
  if (!cardDb) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={theme.colors.purple}
          testID="ActivityIndicator"
        />
      </View>
    );
  }

  React.useEffect(() => {
    if (!cardDb || !cards || cards.length === 0) {
      setCardDataMap({});
      return;
    }
    const fetchData = async () => {
      const ids = cards.map((c) => c.cardId).filter(Boolean);
      if (!ids.length) return;
      const placeholders = ids.map(() => "?").join(", ");
      const results = await cardDb.getAllAsync?.<{
        cardId: string;
        name: string;
        supertype: string;
        imagesLarge: string;
      }>(`SELECT cardId, name, supertype, imagesLarge FROM Card WHERE cardId IN (${placeholders})`, ids);
      const dataMap: { [id: string]: { name: string; supertype: string; imagesLarge: string } } = {};
      results?.forEach((row) => {
        dataMap[row.cardId] = { name: row.name, supertype: row.supertype, imagesLarge: row.imagesLarge };
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

  // Helper: navigation handler for card details
  const handleCardPress = (item: any) => {
    router.push({
      pathname: "/cards/[cardId]",
      params: { cardId: item.cardId, watchlistId: watchlistId, from: "watchlistDetail" },
    });
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
          {groupCards.map((item, idx) => {
            const dbData = cardDataMap[item.cardId] || {};
            return (
              <TouchableOpacity
                key={item.cardId || idx}
                style={{ position: "relative" }}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item)}
                accessibilityLabel={`View details for ${item.name || item.cardId}`}
                accessibilityRole="button"
              >
                <CompactCard
                  card={{
                    cardId: item.cardId,
                    name: item.name || dbData.name || item.cardId,
                    imagesLarge: item.imagesLarge || dbData.imagesLarge || "",
                  }}
                />
                {/* Overlay delete button in top right */}
                <TouchableOpacity
                  onPress={(e) => {
                    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
                    handleDeleteCard(item.cardId);
                  }}
                  accessibilityLabel="Remove card"
                  accessibilityRole="button"
                  style={styles.numberButton}
                >
                  <View style={styles.button}>
                    <View style={styles.iconContainerStyle}>
                      <ThemedText style={styles.numberStyle}>×</ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      </React.Fragment>
    );
  };

  // Always call all hooks, render empty state in returned JSX
  return (
    <View>
      {cards.length === 0 ? (
        <ThemedText style={{ paddingVertical: theme.padding.medium }}>No cards in this watchlist.</ThemedText>
      ) : (
        (["Pokémon", "Trainer", "Energy"] as const).map((group, idx) => renderGroup(group, grouped[group], idx))
      )}
    </View>
  );
}
