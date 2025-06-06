import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import { UserDatabaseProvider, useUserDatabase } from "@/components/context/UserDatabaseContext";
import { useLimitlessDatabase } from "@/components/context/LimitlessDatabaseContext";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import DeckCardList from "@/components/deckbuilder/DeckCardList";
import DeckThumbnailList from "@/components/deckbuilder/DeckThumbnailList";
import ThemedView from "@/components/base/ThemedView";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

function DeckLibraryDetailContent() {
  const { db: limitlessDb, isLoading, isUpdating, error } = useLimitlessDatabase();
  const {
    db: userDb,
    incrementDecksVersion,
    isLoading: isUserDbLoading,
    isUpdating: isUserDbUpdating,
    error: userDbError,
  } = useUserDatabase();
  const { db: cardDb } = useCardDatabase();
  const { deckLibraryId } = useLocalSearchParams<{ deckLibraryId: string }>();
  const [deck, setDeck] = useState<any | null>(null);
  const [cloning, setCloning] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "thumbnails">(() => "thumbnails");
  const [cardDetails, setCardDetails] = useState<any[]>([]);
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

  useEffect(() => {
    if (!cardDb || !deck) return setCardDetails([]);
    let cardsArr: any[] = [];
    try {
      cardsArr = Array.isArray(deck.cards) ? deck.cards : JSON.parse(deck.cards || "[]");
    } catch {
      cardsArr = [];
    }
    if (!cardsArr.length) return setCardDetails([]);
    const ids = cardsArr.map((c: any) => c.cardId).filter(Boolean);
    if (!ids.length) return setCardDetails([]);
    const fetch = async () => {
      const placeholders = ids.map(() => "?").join(", ");
      const results = await cardDb.getAllAsync<{
        cardId: string;
        name: string;
        imagesLarge: string;
        supertype: string;
      }>(`SELECT cardId, name, imagesLarge, supertype FROM Card WHERE cardId IN (${placeholders})`, ids);
      const merged = cardsArr.map((c: any) => {
        const found = results.find((r: any) => r.cardId === c.cardId);
        return {
          cardId: c.cardId,
          quantity: c.quantity || 1,
          name: found?.name || c.cardId,
          imagesLarge: found?.imagesLarge || "",
          supertype: found?.supertype || "",
        };
      });
      setCardDetails(merged);
    };
    fetch();
  }, [deck, cardDb]);

  const handleCloneToMyDecks = async () => {
    if (!userDb || !deck) return;
    setCloning(true);
    try {
      let formattedName = deck.name
        .replace(/\[|\]/g, "")
        .split(",")
        .map((n: string) => n.trim())
        .map((n: string) =>
          n
            .split(" ")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        )
        .join(" ");
      let baseName = formattedName.replace(/#\d+$/, "").trim();
      let newName = `${baseName} - Cloned`;
      const { addDeck, getSavedDecks } = await import("@/lib/userDatabase");
      const allDecks = await getSavedDecks(userDb);
      let uniqueName = newName;
      let cloneIndex = 1;
      while (allDecks.some((d: any) => d.name === uniqueName)) {
        uniqueName = `${newName} #${cloneIndex}`;
        cloneIndex++;
      }
      const result = await addDeck(userDb, uniqueName, deck.thumbnail || undefined, deck.cards);
      let newDeckId: string | number | undefined = undefined;
      if (result && typeof result === "object") {
        if ("insertId" in result && result.insertId != null) {
          newDeckId = result.insertId as string | number;
        } else if ("lastInsertRowId" in result && result.lastInsertRowId != null) {
          newDeckId = result.lastInsertRowId as string | number;
        }
      } else if (typeof result === "string" || typeof result === "number") {
        newDeckId = result;
      }
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
      if (newDeckId) {
        router.replace(`/decks/${String(newDeckId)}`);
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setCloning(false);
    }
  };

  // Helper to parse deck.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(deck?.cards) ? deck.cards : JSON.parse(deck?.cards || "[]");
    } catch {
      return [];
    }
  };
  const totalCardCount = getCardsArray().reduce((sum: number, card: any) => sum + (card.quantity || 1), 0);

  // Format deck name for header
  const formattedName =
    deck && deck.name
      ? deck.name
          .replace(/\[|\]/g, "")
          .split(",")
          .map((n: string) => n.trim())
          .map((n: string) =>
            n
              .split(" ")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          )
          .join(" ")
      : "Deck Details";

  if (
    error ||
    userDbError ||
    !limitlessDb ||
    isLoading ||
    isUpdating ||
    !deck ||
    !userDb ||
    isUserDbLoading ||
    isUserDbUpdating
  ) {
    return (
      <MainScrollView
        headerImage="deck-library-bkg"
        headerTitle="Deck Details"
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          {error || userDbError ? (
            <ThemedText>Error loading database: {error?.message || userDbError?.message}</ThemedText>
          ) : (
            <ActivityIndicator
              size="large"
              color={theme.colors.purple}
            />
          )}
        </View>
      </MainScrollView>
    );
  }

  return (
    <MainScrollView
      headerImage="deck-library-bkg"
      headerTitle={formattedName}
    >
      <View style={{ paddingHorizontal: theme.padding.large, paddingVertical: theme.padding.medium }}>
        {deck.variantOf && <ThemedText color={theme.colors.grey}>Variant of: {deck.variantOf}</ThemedText>}
        {deck.player && <ThemedText color={theme.colors.grey}>Player: {deck.player}</ThemedText>}
        {deck.tournament && <ThemedText color={theme.colors.grey}>Tournament: {deck.tournament}</ThemedText>}
      </View>
      <ThemedView
        style={{
          marginBottom: getCardsArray().length > 0 ? theme.padding.large * -1.5 : theme.padding.large,
          paddingBottom: getCardsArray().length > 0 ? theme.padding.xlarge : undefined,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: theme.padding.small,
            marginBottom: theme.padding.large,
          }}
        >
          <ThemedText type="h2">Cards ({totalCardCount})</ThemedText>
          <ThemedButton
            title={viewMode === "list" ? "Thumb View" : "List View"}
            type="outline"
            size="small"
            onPress={() => setViewMode(viewMode === "list" ? "thumbnails" : "list")}
          />
        </View>
        {viewMode === "list" ? (
          <DeckCardList
            cards={cardDetails}
            deckId={Number(deckLibraryId)}
            edit={false}
          />
        ) : (
          <DeckThumbnailList
            cards={cardDetails}
            deckId={Number(deckLibraryId)}
            edit={false}
          />
        )}
      </ThemedView>
      <ThemedView
        style={{
          marginBottom: theme.padding.large,
        }}
      >
        <ThemedButton
          title={cloning ? "Cloning..." : "Clone to My Decks"}
          type="main"
          size="small"
          onPress={handleCloneToMyDecks}
          disabled={cloning}
        />
      </ThemedView>
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
