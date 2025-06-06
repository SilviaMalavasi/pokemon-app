import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import { useLimitlessDatabase } from "@/components/context/LimitlessDatabaseContext";
import { theme } from "@/style/ui/Theme";
import deckLibraryMapping from "@/helpers/deckLibraryMapping";
import cardImageMapping from "@/helpers/cardImageMapping";
import CompactDeckLibrary from "@/components/decklibrary/CompactDeckLibrary";
import ThemedView from "@/components/base/ThemedView";

export default function DeckLibraryVariantScreen() {
  const { db, isLoading, isUpdating, error } = useLimitlessDatabase();
  const { variantOf } = useLocalSearchParams<{ variantOf: string }>();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!db || !variantOf) return;
    let cancelled = false;
    setLoading(true);
    async function fetchDecks() {
      try {
        const { getLimitlessDecks } = await import("@/lib/limitlessDatabase");
        const allDecks = await getLimitlessDecks(db!);
        const filtered = allDecks.filter((deck) => deck.variantOf === variantOf);
        if (!cancelled) setDecks(filtered);
      } catch (e) {
        if (!cancelled) setDecks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDecks();
    return () => {
      cancelled = true;
    };
  }, [db, variantOf]);

  const mapping = deckLibraryMapping[variantOf as string];

  if (error) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle={variantOf}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ThemedText>Error loading database: {error.message}</ThemedText>
        </View>
      </MainScrollView>
    );
  }
  if (loading) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle={variantOf}
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

  return (
    <MainScrollView
      headerImage="deck-library-bkg"
      headerTitle={variantOf}
    >
      <ThemedView style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <View style={{ paddingVertical: theme.padding.medium }}>
          {decks.length > 0 ? (
            decks.map((deck) => (
              <CompactDeckLibrary
                key={deck.id}
                variantOf={deck.variantOf}
                thumbnail={deck.thumbnail}
                router={router}
                layout="edit"
                player={deck.player}
                tournament={deck.tournament}
                name={deck.name}
                id={deck.id}
              />
            ))
          ) : (
            <View style={{ alignItems: "center", marginTop: theme.padding.large }}>
              <ThemedText>No decks found for this variant.</ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </MainScrollView>
  );
}
