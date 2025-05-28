import React from "react";
import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import { ActivityIndicator, View } from "react-native";
import ExternalLink from "@/components/base/ExternalLink";
import { LimitlessDatabaseProvider, useLimitlessDatabase } from "@/components/context/LimitlessDatabaseContext";
import { theme } from "@/style/ui/Theme";

function DeckLibraryContent() {
  const { db, isLoading, isUpdating, error } = useLimitlessDatabase();
  const [limitlessDecks, setLimitlessDecks] = React.useState<any[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    async function fetchDecks() {
      if (!db) return;
      try {
        const { getLimitlessDecks } = await import("@/lib/limitlessDatabase");
        const decks = await getLimitlessDecks(db);
        if (!cancelled) setLimitlessDecks(decks);
      } catch (e) {
        if (!cancelled) setLimitlessDecks([]);
      }
    }
    fetchDecks();
    return () => {
      cancelled = true;
    };
  }, [db]);

  if (error) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle="Deck Library"
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ThemedText>Error loading database: {error.message}</ThemedText>
        </View>
      </MainScrollView>
    );
  }
  if (!db || isLoading || isUpdating) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle="Deck Library"
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
      headerTitle="Deck Library"
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
            Last Decks Update:{" "}
          </ThemedText>
          27/05/2025
        </ThemedText>
        <ThemedText>
          Credits goes to <ExternalLink href="https://limitlesstcg.com/">limitlesstcg.com</ExternalLink>
        </ThemedText>
      </View>
      {limitlessDecks.length > 0 ? (
        <View style={{ paddingHorizontal: theme.padding.large }}>
          {limitlessDecks.map((deck) => (
            <View
              key={deck.id}
              style={{ marginBottom: 16 }}
            >
              <ThemedText fontWeight="bold">{deck.name}</ThemedText>
              <ThemedText color={theme.colors.grey}>Variant: {deck.variantOf || "-"}</ThemedText>
              {deck.player && <ThemedText color={theme.colors.grey}>Player: {deck.player}</ThemedText>}
              {deck.tournament && <ThemedText color={theme.colors.grey}>Tournament: {deck.tournament}</ThemedText>}
              {deck.thumbnail && <ThemedText color={theme.colors.grey}>Thumbnail: {deck.thumbnail}</ThemedText>}
              <ThemedText
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ fontSize: 12 }}
              >
                Cards: {deck.cards.length > 100 ? deck.cards.slice(0, 100) + "..." : deck.cards}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : isLoading || isUpdating ? (
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <ActivityIndicator
            size="large"
            color={theme.colors.purple}
          />
        </View>
      ) : (
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <ThemedText>No decks found.</ThemedText>
        </View>
      )}
    </MainScrollView>
  );
}

export default function DeckLibraryScreen() {
  return (
    <LimitlessDatabaseProvider>
      <DeckLibraryContent />
    </LimitlessDatabaseProvider>
  );
}
