import React, { useState, useEffect, useCallback } from "react";
import MainScrollView from "@/components/ui/MainScrollView";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addWatchList, getWatchLists, deleteWatchList } from "@/lib/userDatabase";
import NewWatchlist from "@/components/deckbuilder/NewWatchlist";
import WatchLists from "@/components/deckbuilder/WatchLists";
import { BackHandler } from "react-native";
import { useRouter } from "expo-router";

interface Watchlist {
  id: number;
  name: string;
  thumbnail: string | null;
  cards: string;
}

export default function WatchlistScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { db, isLoading: dbLoading, error: dbError, decksVersion, incrementWatchListsVersion } = useUserDatabase();
  const router = useRouter();

  const [watchlistName, setWatchlistName] = useState("");
  const [watchlistThumbnail, setWatchlistThumbnail] = useState("");
  const [watchLists, setWatchLists] = useState<Watchlist[]>([]);
  const [isLoadingWatchLists, setIsLoadingWatchLists] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchWatchLists = useCallback(async () => {
    if (!db) return;
    setIsLoadingWatchLists(true);
    try {
      const lists = await getWatchLists(db);
      setWatchLists(lists);
    } catch (error) {
      console.error("Failed to fetch watchlists:", error);
    } finally {
      setIsLoadingWatchLists(false);
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      fetchWatchLists();
    }
  }, [db, decksVersion, fetchWatchLists]);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      if (db) {
        fetchWatchLists();
      }
    }, [db, fetchWatchLists])
  );

  const handleSaveWatchList = async () => {
    if (!db) {
      console.warn("Error", "Database not available.");
      return;
    }
    try {
      await addWatchList(db, watchlistName, "[]", watchlistThumbnail || undefined);
      setWatchlistName("");
      setWatchlistThumbnail("");
      fetchWatchLists();
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
        await fetchWatchLists();
        await incrementWatchListsVersion(); // Ensure context is updated after deletion
      } catch (e) {
        console.error("Failed to delete watchlist", e);
      } finally {
        setDeletingId(null);
      }
    },
    [db, fetchWatchLists, incrementWatchListsVersion]
  );

  const handleThumbnailSelect = (imagesLargeUrl: string) => {
    setWatchlistThumbnail(imagesLargeUrl);
  };

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
        style={{ marginTop: -24 }}
      />
    </MainScrollView>
  );
}
