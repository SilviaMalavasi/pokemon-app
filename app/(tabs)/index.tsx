import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import ExternalLink from "@/components/base/ExternalLink";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import React, { useState } from "react";
import SavedDecks from "@/components/deckbuilder/SavedDecks";
import WatchLists from "@/components/deckbuilder/WatchLists";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { ActivityIndicator, View } from "react-native";
import NewDeck from "@/components/deckbuilder/NewDeck";
import NewWatchlist from "@/components/deckbuilder/NewWatchlist";
import ThemedView from "@/components/ui/ThemedView";
import { theme } from "@/style/ui/Theme";
import { useRouter } from "expo-router";
import ThemedButton from "@/components/base/ThemedButton";

export default function HomeScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const {
    db,
    isLoading: dbLoading,
    error: dbError,
    decksVersion,
    decks,
    isLoadingDecks,
    watchLists,
    isLoadingWatchLists,
  } = useUserDatabase();
  const [deletingId] = useState(null);
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
      const { addDeck } = await import("@/lib/userDatabase");
      await addDeck(db, deckName, deckThumbnail || undefined);
      setDeckName("");
      setDeckThumbnail("");
      // decksVersion will trigger context refresh
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
      // watchListsVersion will trigger context refresh
    } catch (error) {
      console.error("Failed to save watchlist:", error);
    }
  };

  const handleWatchlistThumbnailSelect = (imagesLargeUrl: string) => {
    setWatchlistThumbnail(imagesLargeUrl);
  };

  const router = useRouter();

  // Navigation handlers that pass the 'from' parameter
  const navigateToDeck = (deckId: number) => {
    router.push({ pathname: `/decks/${deckId}` as any, params: { from: "home" } });
  };
  const navigateToWatchlist = (watchlistId: number) => {
    router.push({ pathname: `/watchlists/${watchlistId}` as any, params: { from: "home" } });
  };

  if (dbLoading) {
    return (
      <MainScrollView
        headerImage="home-bkg"
        headerTitle="PokéDeck Builder"
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
    return (
      <MainScrollView
        headerImage="home-bkg"
        headerTitle="PokéDeck Builder"
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ThemedText>Error loading database: {dbError.message}</ThemedText>
        </View>
      </MainScrollView>
    );
  }

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
            LAST DB UPDATE:{" "}
          </ThemedText>
          Journey Together
        </ThemedText>
      </View>
      {decks.length > 0 && (
        <SavedDecks
          savedDecks={decks}
          isLoadingDecks={isLoadingDecks}
          deletingId={deletingId}
          layout="view"
          onPressDeck={navigateToDeck}
        />
      )}
      {decks.length === 0 && (
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
      {watchLists.length > 0 && (
        <WatchLists
          watchLists={watchLists}
          isLoadingWatchLists={isLoadingWatchLists}
          deletingId={deletingId}
          layout="view"
          onPressWatchlist={navigateToWatchlist}
        />
      )}
      {watchLists.length === 0 && (
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
      <ThemedView style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <View>
          <ThemedText
            type="default"
            color={theme.colors.white}
            style={{ padding: theme.padding.medium }}
          >
            This app was created with <ThemedText color={theme.colors.purple}>♥</ThemedText> by Pokémon nerd and
            developer{" "}
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
        <View>
          <ThemedText
            type="default"
            color={theme.colors.white}
            style={{ padding: theme.padding.medium }}
          >
            This app is free, use it to build wonderfull decks and have fun. If you like it and you want to support my
            work, you can do it by sharing this app with your friends and by supporting me on Patreon.{" "}
          </ThemedText>
          <ThemedButton
            onPress={() => router.push("https://www.patreon.com/silviamalavasi")}
            title="Buy me a coffe"
            style={{ marginHorizontal: theme.padding.small, marginVertical: theme.padding.small }}
          />
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
