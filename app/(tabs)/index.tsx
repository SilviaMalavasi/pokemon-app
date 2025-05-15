import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import ExternalLink from "@/components/base/ExternalLink";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import SavedDecks from "@/components/deckbuilder/SavedDecks";
import WatchLists from "@/components/deckbuilder/WatchLists";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { getSavedDecks, getWatchLists } from "@/lib/userDatabase";
import { View } from "react-native";
import NewDeck from "@/components/deckbuilder/NewDeck";
import NewWatchlist from "@/components/deckbuilder/NewWatchlist";
import ThemedView from "@/components/ui/ThemedView";
import { theme } from "@/style/ui/Theme";

interface SavedDeck {
  id: number;
  name: string;
  thumbnail: string | null;
  cards: string;
}

interface Watchlist {
  id: number;
  name: string;
  thumbnail: string | null;
  cards: string;
}

export default function HomeScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { db, decksVersion } = useUserDatabase();
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [deletingId] = useState(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isLoadingWatchlists, setIsLoadingWatchlists] = useState(false);

  // --- NewDeck state and handlers ---
  const [deckName, setDeckName] = useState("");
  const [deckThumbnail, setDeckThumbnail] = useState("");

  // --- NewWatchlist state and handlers ---
  const [watchlistName, setWatchlistName] = useState("");
  const [watchlistThumbnail, setWatchlistThumbnail] = useState("");

  const handleSaveDeck = async () => {
    if (!db) {
      console.warn("Error", "Database not available.");
      return;
    }
    try {
      // Import addDeck from userDatabase if not already
      const { addDeck } = await import("@/lib/userDatabase");
      await addDeck(db, deckName, deckThumbnail || undefined);
      setDeckName("");
      setDeckThumbnail("");
      fetchSavedDecks();
    } catch (error) {
      console.error("Failed to save deck:", error);
    }
  };

  const handleThumbnailSelect = (imagesLargeUrl: string) => {
    setDeckThumbnail(imagesLargeUrl);
  };

  const handleSaveWatchList = async () => {
    if (!db) {
      console.warn("Error", "Database not available.");
      return;
    }
    try {
      const { addWatchList } = await import("@/lib/userDatabase");
      await addWatchList(db, watchlistName, watchlistThumbnail || undefined);
      setWatchlistName("");
      setWatchlistThumbnail("");
      fetchWatchlists();
    } catch (error) {
      console.error("Failed to save watchlist:", error);
    }
  };

  const handleWatchlistThumbnailSelect = (imagesLargeUrl: string) => {
    setWatchlistThumbnail(imagesLargeUrl);
  };

  const fetchSavedDecks = useCallback(async () => {
    if (!db) return;
    setIsLoadingDecks(true);
    try {
      const decks = await getSavedDecks(db);
      setSavedDecks(decks);
    } catch (error) {
      console.error("Failed to fetch saved decks:", error);
    } finally {
      setIsLoadingDecks(false);
    }
  }, [db]);

  const fetchWatchlists = useCallback(async () => {
    if (!db) return;
    setIsLoadingWatchlists(true);
    try {
      const lists = await getWatchLists(db);
      setWatchlists(lists);
    } catch (error) {
      console.error("Failed to fetch watchlists:", error);
    } finally {
      setIsLoadingWatchlists(false);
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      fetchSavedDecks();
      fetchWatchlists();
    }
  }, [db, decksVersion, fetchSavedDecks, fetchWatchlists]);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      if (db) {
        fetchSavedDecks();
        fetchWatchlists();
      }
    }, [db, fetchSavedDecks, fetchWatchlists])
  );

  return (
    <MainScrollView
      headerImage="home-bkg"
      headerTitle="PokéDeck Builder"
      scrollRef={scrollRef}
    >
      <View style={{ paddingHorizontal: theme.padding.large, paddingVertical: theme.padding.medium }}>
        <ThemedText
          type="default"
          color={theme.colors.grey}
        >
          <ThemedText
            fontWeight="bold"
            color={theme.colors.grey}
          >
            LAST DATABASE UPDATE:{" "}
          </ThemedText>
          25-05-2015
        </ThemedText>
      </View>
      {savedDecks.length > 0 && (
        <SavedDecks
          savedDecks={savedDecks}
          isLoadingDecks={isLoadingDecks}
          deletingId={deletingId}
          layout="view"
        />
      )}
      {savedDecks.length === 0 && (
        <View style={{ marginBottom: theme.padding.large * -1.5 }}>
          <NewDeck
            deckName={deckName}
            setDeckName={setDeckName}
            deckThumbnail={deckThumbnail}
            setDeckThumbnail={setDeckThumbnail}
            handleSaveDeck={handleSaveDeck}
            handleThumbnailSelect={handleThumbnailSelect}
            layout="titled"
          />
        </View>
      )}
      {watchlists.length > 0 && (
        <WatchLists
          watchLists={watchlists}
          isLoadingWatchLists={isLoadingWatchlists}
          deletingId={deletingId}
          layout="view"
        />
      )}
      {watchlists.length === 0 && (
        <View style={{ marginBottom: theme.padding.large * -1.5 }}>
          <NewWatchlist
            watchlistName={watchlistName}
            setWatchlistName={setWatchlistName}
            watchlistThumbnail={watchlistThumbnail}
            setWatchlistThumbnail={setWatchlistThumbnail}
            handleSaveWatchList={handleSaveWatchList}
            handleThumbnailSelect={handleWatchlistThumbnailSelect}
            layout="titled"
          />
        </View>
      )}
      <ThemedView layout="big">
        <View>
          <ThemedText
            type="default"
            color={theme.colors.white}
            style={{ padding: theme.padding.medium }}
          >
            This app was created with ♥ by Pokémon nerd and developer{" "}
            <ExternalLink
              color="alternative"
              href="https://www.linkedin.com/in/silvia-malavasi/"
            >
              Silvia Malavasi
            </ExternalLink>{" "}
            for the Pokémon TCG community. Credits goes to{" "}
            <ExternalLink href="https://pokemontcg.io/">pokemontcg.io </ExternalLink>
            for the Card Archive.
          </ThemedText>
        </View>
        <View style={{ padding: theme.padding.medium }}>
          <ThemedText
            type="default"
            color={theme.colors.grey}
          >
            This app is not produced, endorsed, supported, or affiliated with Nintendo or The Pokémon Company.
          </ThemedText>
        </View>
      </ThemedView>
    </MainScrollView>
  );
}
