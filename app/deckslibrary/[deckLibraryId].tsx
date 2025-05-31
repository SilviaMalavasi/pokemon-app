import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import { UserDatabaseProvider, useUserDatabase } from "@/components/context/UserDatabaseContext";
import { useLimitlessDatabase } from "@/components/context/LimitlessDatabaseContext";
import { theme } from "@/style/ui/Theme";

function DeckLibraryDetailContent() {
  const { db: limitlessDb, isLoading, isUpdating, error } = useLimitlessDatabase();
  const { db: userDb, incrementDecksVersion } = useUserDatabase();
  const { deckLibraryId } = useLocalSearchParams<{ deckLibraryId: string }>();
  const [deck, setDeck] = useState<any | null>(null);
  const [cloning, setCloning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!limitlessDb || !deckLibraryId) return;
    let cancelled = false;
    async function fetchDeck() {
      try {
        const { getLimitlessDeckById } = await import("@/lib/limitlessDatabase");
        const deckData = await getLimitlessDeckById(limitlessDb!, Number(deckLibraryId));
        if (!cancelled) setDeck(deckData);
      } catch (e) {
        if (!cancelled) setDeck(null);
      }
    }
    fetchDeck();
    return () => {
      cancelled = true;
    };
  }, [limitlessDb, deckLibraryId]);

  const handleCloneToMyDecks = async () => {
    if (!userDb || !deck) return;
    setCloning(true);
    try {
      const { addDeck, getSavedDecks } = await import("@/lib/userDatabase");
      let baseName = deck.name.replace(/#\d+$/, "").trim();
      let cloneNumber = 1;
      let newName = `${baseName} #${cloneNumber}`;
      const allDecks = await getSavedDecks(userDb!);
      const regex = new RegExp(`^${baseName} #(\\d+)$`);
      const usedNumbers = allDecks
        .map((d) => {
          const match = d.name.match(regex);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((n) => n !== null);
      while (usedNumbers.includes(cloneNumber)) {
        cloneNumber++;
        newName = `${baseName} #${cloneNumber}`;
      }
      await addDeck(userDb!, newName, deck.thumbnail || undefined, deck.cards);
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
      router.replace("/deckbuilder");
    } catch (e) {
      // Optionally show error
    } finally {
      setCloning(false);
    }
  };

  if (error) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle="Deck Details"
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ThemedText>Error loading database: {error.message}</ThemedText>
        </View>
      </MainScrollView>
    );
  }
  if (!limitlessDb || isLoading || isUpdating || !deck) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle="Deck Details"
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
      headerTitle={deck.name}
    >
      <View style={{ paddingHorizontal: theme.padding.large, paddingVertical: theme.padding.medium }}>
        <ThemedText fontWeight="bold">{deck.name}</ThemedText>
        <ThemedText color={theme.colors.grey}>Variant: {deck.variantOf || "-"}</ThemedText>
        {deck.player && <ThemedText color={theme.colors.grey}>Player: {deck.player}</ThemedText>}
        {deck.tournament && <ThemedText color={theme.colors.grey}>Tournament: {deck.tournament}</ThemedText>}
        {deck.thumbnail && <ThemedText color={theme.colors.grey}>Thumbnail: {deck.thumbnail}</ThemedText>}
        <ThemedText style={{ fontSize: 12 }}>
          Cards: {deck.cards.length > 100 ? deck.cards.slice(0, 100) + "..." : deck.cards}
        </ThemedText>
        <ThemedButton
          title={cloning ? "Cloning..." : "Clone to My Decks"}
          type="main"
          size="large"
          onPress={handleCloneToMyDecks}
          disabled={cloning}
          style={{ marginTop: theme.padding.large }}
        />
      </View>
    </MainScrollView>
  );
}

export default function DeckLibraryDetailScreen() {
  return (
    <UserDatabaseProvider>
      <DeckLibraryDetailContent />
    </UserDatabaseProvider>
  );
}
