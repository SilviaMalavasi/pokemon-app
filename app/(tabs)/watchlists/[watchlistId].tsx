import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import MainScrollView from "@/components/ui/MainScrollView";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import { ActivityIndicator, View } from "react-native";
import AddCardToWatchList from "@/components/deckbuilder/AddCardToWatchlist";
import WatchlistThumbnailList from "@/components/deckbuilder/WatchlistThumbnailList";
import ThemedView from "@/components/ui/ThemedView";
import { theme } from "@/style/ui/Theme";

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

  const handleCloneWatchlist = async () => {
    // Implement clone functionality here
  };

  const handleEditWatchlist = async () => {
    // Implement edit functionality here
  };

  const handleDeleteWatchlist = async () => {
    // Implement delete functionality here
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
            color={theme.colors.purple}
            style={{ marginTop: 200 }}
          />
        ) : error ? (
          <ThemedText>Error loading watchlist: {error.message}</ThemedText>
        ) : watchList ? (
          <>
            <AddCardToWatchList
              watchlist={watchList}
              db={db}
              onCardAdded={async () => {
                // Refresh watchlist after card is added
                if (db) {
                  const updatedWatchList = await db.getFirstAsync<any>(`SELECT * FROM WatchedCards WHERE id = ?`, [
                    watchlistId,
                  ]);
                  setWatchList(updatedWatchList);
                  // Optionally refresh card details
                  let cardsArr = [];
                  try {
                    cardsArr = Array.isArray(updatedWatchList?.cards)
                      ? updatedWatchList.cards
                      : JSON.parse(updatedWatchList?.cards || "[]");
                  } catch {
                    cardsArr = [];
                  }
                  if (cardsArr.length > 0 && cardDb) {
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
                }
              }}
            />
            <ThemedView style={{ marginBottom: theme.padding.large * -1.5 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: theme.padding.small,
                  marginBottom: theme.padding.large,
                }}
              >
                <ThemedText type="h2">Cards ({cardDetails.length})</ThemedText>
              </View>
              <WatchlistThumbnailList
                cards={cardDetails}
                watchlistId={Number(watchlistId)}
                db={db}
                onCardsChanged={async () => {
                  if (db) {
                    const updatedWatchList = await db.getFirstAsync<any>(`SELECT * FROM WatchedCards WHERE id = ?`, [
                      watchlistId,
                    ]);
                    setWatchList(updatedWatchList);
                    // Optionally refresh card details
                    let cardsArr = [];
                    try {
                      cardsArr = Array.isArray(updatedWatchList?.cards)
                        ? updatedWatchList.cards
                        : JSON.parse(updatedWatchList?.cards || "[]");
                    } catch {
                      cardsArr = [];
                    }
                    if (cardsArr.length > 0 && cardDb) {
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
                  }
                }}
              />
              <View style={{ marginBottom: theme.padding.xlarge }} />
            </ThemedView>
            <ThemedView
              layout="rounded"
              style={{ marginBottom: theme.padding.large }}
            >
              <ThemedButton
                title="Clone"
                type="main"
                size="large"
                onPress={handleCloneWatchlist}
              />
              <ThemedButton
                title="Edit"
                type="main"
                size="large"
                onPress={handleEditWatchlist}
              />
              <ThemedButton
                title="Delete"
                type="alternative"
                size="large"
                onPress={handleDeleteWatchlist}
              />
            </ThemedView>
          </>
        ) : (
          <ThemedText>Watchlist not found.</ThemedText>
        )}
      </View>
    </MainScrollView>
  );
}
