import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ThemedText from "@/components/base/ThemedText";
import MainScrollView from "@/components/ui/MainScrollView";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import { ActivityIndicator, View } from "react-native";
import { theme } from "@/style/ui/Theme";
import CompactCard from "@/components/CompactCard";
import WatchlistStyle from "@/style/WatchlistStyle";

export default function WatchListDetailScreen() {
  const { watchlistId } = useLocalSearchParams<{ watchlistId: string }>();
  const { db, isLoading: dbLoading, error, watchLists, watchListsVersion } = useUserDatabase();
  const { db: cardDb, isLoading: cardDbLoading } = useCardDatabase();
  const [watchList, setWatchList] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardDetails, setCardDetails] = useState<any[]>([]);

  useEffect(() => {
    if (!watchlistId || !db || !cardDb) return;
    const fetchWatchList = async () => {
      setLoading(true);
      try {
        const wl = await db.getFirstAsync<any>(`SELECT * FROM WatchedCards WHERE id = ?`, [Number(watchlistId)]);
        setWatchList(wl);
        // Fetch card details if cards exist
        let cardsArr = [];
        try {
          cardsArr = Array.isArray(wl?.cards) ? wl.cards : JSON.parse(wl?.cards || "[]");
        } catch {
          cardsArr = [];
        }
        if (cardsArr.length > 0) {
          const ids = cardsArr.map((c: any) => c.cardId);
          const placeholders = ids.map(() => "?").join(",");
          const details = await cardDb.getAllAsync<any>(
            `SELECT cardId, name, imagesLarge FROM Card WHERE cardId IN (${placeholders})`,
            ids
          );
          setCardDetails(details);
        } else {
          setCardDetails([]);
        }
      } catch (error) {
        console.warn("Error fetching watchList:", error);
        setWatchList(null);
        setCardDetails([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchList();
  }, [watchlistId, db, cardDb, watchListsVersion]);

  useEffect(() => {
    if (!db) return;
    // Optionally, you could add a fetch here if you want to refresh watchLists in this context
  }, [db, watchListsVersion]);

  // Helper to parse watchList.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(watchList?.cards) ? watchList.cards : JSON.parse(watchList?.cards || "[]");
    } catch {
      return [];
    }
  };

  return (
    <MainScrollView
      headerImage="deck-bkg"
      headerTitle={watchList?.name || "WatchList Details"}
    >
      <View>
        {loading || dbLoading || cardDbLoading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.greyAlternative}
            style={{ marginTop: 200 }}
          />
        ) : error ? (
          <ThemedText>Error loading watchlist: {error.message}</ThemedText>
        ) : watchList ? (
          <>
            <ThemedText type="h2">Cards ({getCardsArray().length})</ThemedText>
            {getCardsArray().length === 0 ? (
              <ThemedText>No cards in this watchlist.</ThemedText>
            ) : (
              <View style={WatchlistStyle.cardList}>
                {cardDetails.map((card: any, idx: number) => (
                  <View key={card.cardId || idx}>
                    <CompactCard
                      card={card}
                      onImageLoad={() => {}}
                      loading={false}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <ThemedText>WatchList not found.</ThemedText>
        )}
      </View>
    </MainScrollView>
  );
}
