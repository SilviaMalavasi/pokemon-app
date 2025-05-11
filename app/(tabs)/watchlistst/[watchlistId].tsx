import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { ActivityIndicator } from "react-native";
import { theme } from "@/style/ui/Theme";
import SearchResult from "@/components/SearchResult";

export default function WatchListDetailScreen() {
  const { watchlistId } = useLocalSearchParams<{ watchlistId: string }>();
  const { db, isLoading: dbLoading, error, watchLists, watchListsVersion } = useUserDatabase();
  const [watchList, setWatchList] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!watchlistId || !db) return;
    const fetchWatchList = async () => {
      setLoading(true);
      try {
        const wl = await db.getFirstAsync<any>(`SELECT * FROM WatchedCards WHERE id = ?`, [Number(watchlistId)]);
        setWatchList(wl);
      } catch (error) {
        setWatchList(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchList();
  }, [watchlistId, db, watchListsVersion]);

  // Helper to parse watchList.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(watchList?.cards) ? watchList.cards : JSON.parse(watchList?.cards || "[]");
    } catch {
      return [];
    }
  };

  return (
    <ParallaxScrollView
      headerImage="deck-bkg"
      headerTitle={watchList?.name || "WatchList Details"}
    >
      <ThemedView>
        {loading || dbLoading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.textAlternative}
            style={{ marginTop: 200 }}
          />
        ) : error ? (
          <ThemedText>Error loading watchlist: {error.message}</ThemedText>
        ) : watchList ? (
          <>
            <ThemedText type="subtitle">Cards ({getCardsArray().length})</ThemedText>
            {getCardsArray().length === 0 ? (
              <ThemedText>No cards in this watchlist.</ThemedText>
            ) : (
              getCardsArray().map((card: any, idx: number) => (
                <SearchResult
                  key={card.cardId || idx}
                  cardIds={[card.cardId]}
                />
              ))
            )}
          </>
        ) : (
          <ThemedText>WatchList not found.</ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}
