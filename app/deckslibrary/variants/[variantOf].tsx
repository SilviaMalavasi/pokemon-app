import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import { useLimitlessDatabase } from "@/components/context/LimitlessDatabaseContext";
import { theme } from "@/style/ui/Theme";
import deckLibraryMapping from "@/helpers/deckLibraryMapping";
import cardImageMapping from "@/helpers/cardImageMapping";

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
      <View style={{ alignItems: "center", marginVertical: theme.padding.large }}>
        {mapping && cardImageMapping[mapping.thumbnail] && (
          <Image
            source={cardImageMapping[mapping.thumbnail]}
            style={{ width: 100, height: 140, borderRadius: 10, marginBottom: theme.padding.medium }}
            resizeMode="cover"
          />
        )}
        <ThemedText
          fontWeight="bold"
          style={{ fontSize: 20, marginBottom: theme.padding.medium }}
        >
          {variantOf}
        </ThemedText>
      </View>
      {decks.length > 0 ? (
        decks.map((deck) => (
          <TouchableOpacity
            key={deck.id}
            style={{
              backgroundColor: theme.colors.darkGrey,
              borderRadius: 10,
              marginHorizontal: theme.padding.large,
              marginBottom: theme.padding.medium,
              padding: theme.padding.medium,
            }}
            onPress={() => router.push(`/deckslibrary/${deck.id}`)}
          >
            <ThemedText fontWeight="bold">{deck.name}</ThemedText>
            {deck.player && <ThemedText color={theme.colors.grey}>Player: {deck.player}</ThemedText>}
            {deck.tournament && <ThemedText color={theme.colors.grey}>Tournament: {deck.tournament}</ThemedText>}
          </TouchableOpacity>
        ))
      ) : (
        <View style={{ alignItems: "center", marginTop: theme.padding.large }}>
          <ThemedText>No decks found for this variant.</ThemedText>
        </View>
      )}
    </MainScrollView>
  );
}
