import React, { useState, useCallback } from "react";
import MainScrollView from "@/components/ui/MainScrollView";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addWatchList, deleteWatchList } from "@/lib/userDatabase";
import NewWatchlist from "@/components/deckbuilder/NewWatchlist";
import WatchLists from "@/components/deckbuilder/WatchLists";
import { ActivityIndicator, View } from "react-native";
import { theme } from "@/style/ui/Theme";

export default function WatchlistScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const {
    db,
    isLoading: dbLoading,
    error: dbError,
    watchLists,
    isLoadingWatchLists,
    incrementWatchListsVersion,
  } = useUserDatabase();

  const [watchlistName, setWatchlistName] = useState("");
  const [watchlistThumbnail, setWatchlistThumbnail] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSaveWatchList = async () => {
    if (!db) {
      console.warn("Error", "Database not available.");
      return;
    }
    try {
      await addWatchList(db, watchlistName, "[]", watchlistThumbnail || undefined);
      setWatchlistName("");
      setWatchlistThumbnail("");
      incrementWatchListsVersion();
    } catch (error) {
      console.error("Failed to save watchlist:", error);
    }
  };

  const handleDeleteWatchList = useCallback(
    async (id: number) => {
      if (!db) return;
      setDeletingId(id);
      try {
        await deleteWatchList(db, id);
        incrementWatchListsVersion();
      } catch (e) {
        console.error("Failed to delete watchlist", e);
      } finally {
        setDeletingId(null);
      }
    },
    [db, incrementWatchListsVersion]
  );

  const handleThumbnailSelect = (imagesLargeUrl: string) => {
    setWatchlistThumbnail(imagesLargeUrl);
  };

  if (isLoadingWatchLists) {
    return (
      <MainScrollView
        headerImage="watchlist-bkg"
        headerTitle="Watchlists"
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ActivityIndicator
            size="large"
            color={theme.colors.purple}
          />
        </View>
      </MainScrollView>
    );
  }

  if (dbError) {
    console.error("Error loading database:", dbError);
  }

  return (
    <MainScrollView
      headerImage="watchlist-bkg"
      headerTitle="Watchlists"
      scrollRef={scrollRef}
    >
      <NewWatchlist
        watchlistName={watchlistName}
        setWatchlistName={setWatchlistName}
        watchlistThumbnail={watchlistThumbnail}
        setWatchlistThumbnail={setWatchlistThumbnail}
        handleSaveWatchList={handleSaveWatchList}
        handleThumbnailSelect={handleThumbnailSelect}
      />
      <WatchLists
        watchLists={watchLists}
        isLoadingWatchLists={isLoadingWatchLists}
        onDelete={handleDeleteWatchList}
        deletingId={deletingId}
        layout="edit"
        style={{ marginTop: theme.padding.large * -1 }}
      />
    </MainScrollView>
  );
}
