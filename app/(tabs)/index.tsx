import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import ExternalLink from "@/components/base/ExternalLink";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import SavedDecks from "@/components/deckbuilder/SavedDecks";
import WatchLists from "@/components/deckbuilder/WatchLists";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { getSavedDecks } from "@/lib/userDatabase";
import { View } from "react-native";
import { theme } from "@/style/ui/Theme";

interface SavedDeck {
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

  useEffect(() => {
    if (db) {
      fetchSavedDecks();
    }
  }, [db, decksVersion, fetchSavedDecks]);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      if (db) {
        fetchSavedDecks();
      }
    }, [db, fetchSavedDecks])
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
      <SavedDecks
        savedDecks={savedDecks}
        isLoadingDecks={isLoadingDecks}
        deletingId={deletingId}
        layout="view"
      />
      <WatchLists />
      <View>
        <ThemedText
          type="hintText"
          color={theme.colors.grey}
        >
          This app is not produced, endorsed, supported, or affiliated with Nintendo or The Pokémon Company.
        </ThemedText>
      </View>
      <View>
        <ThemedText
          type="default"
          color={theme.colors.white}
          style={{ paddingTop: theme.padding.medium, paddingBottom: theme.padding.xlarge * 1.5 }}
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
    </MainScrollView>
  );
}
