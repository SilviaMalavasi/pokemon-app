import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MainScrollView from "@/components/ui/MainScrollView";
import ThemedText from "@/components/base/ThemedText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import React, { useRef } from "react";
import AddCardToDeck from "@/components/deckbuilder/AddCardToDeck";
import DeckCardList from "@/components/deckbuilder/DeckCardList";
import { theme } from "@/style/ui/Theme";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import DeckThumbnailList from "@/components/deckbuilder/DeckThumbnailList";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import DeckImportExport from "@/components/deckbuilder/DeckImportExport";

export default function DeckScreen() {
  const router = useRouter();
  const { deckId, from } = useLocalSearchParams<{ deckId: string; from?: string }>();
  const [deck, setDeck] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { db, isLoading: dbLoading, error, decksVersion, incrementDecksVersion } = useUserDatabase();
  const { db: cardDb } = useCardDatabase();
  const [viewMode, setViewMode] = useState<"list" | "thumbnails">(() => {
    return "thumbnails";
  });
  const [cardDetails, setCardDetails] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [saving, setSaving] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const prevDeckIdRef = useRef<string | undefined>(undefined);

  useFocusEffect(
    React.useCallback(() => {
      // Only scroll to top if deckId has changed
      if (prevDeckIdRef.current !== deckId && scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      prevDeckIdRef.current = deckId;
    }, [deckId])
  );

  useEffect(() => {
    if (!deckId || !db) return;
    const fetchDeck = async () => {
      setLoading(true);
      try {
        const deckData = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [Number(deckId)]);
        setDeck(deckData);
      } catch (error) {
        console.error("Error fetching deck from SQLite:", error);
        setDeck(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDeck();
  }, [deckId, db, decksVersion]);

  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!cardDb || !deck) return setCardDetails([]);
      const cardsArr = getCardsArray();
      if (!cardsArr.length) return setCardDetails([]);
      const ids = cardsArr.map((c: any) => c.cardId).filter(Boolean);
      if (!ids.length) return setCardDetails([]);
      const placeholders = ids.map(() => "?").join(", ");
      // Fetch supertype as well
      const results = await cardDb.getAllAsync<{
        cardId: string;
        name: string;
        imagesLarge: string;
        supertype: string;
      }>(`SELECT cardId, name, imagesLarge, supertype FROM Card WHERE cardId IN (${placeholders})`, ids);
      // Merge quantity from deck
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
    fetchCardDetails();
  }, [deck, cardDb]);

  // Helper to parse deck.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(deck?.cards) ? deck.cards : JSON.parse(deck?.cards || "[]");
    } catch {
      return [];
    }
  };

  // Calculate total number of cards in the deck
  const totalCardCount = getCardsArray().reduce((sum: number, card: any) => sum + (card.quantity || 1), 0);

  // --- Deck Actions: Clone, Edit, Delete ---
  const handleCloneDeck = async () => {
    if (!deck) return;
    let baseName = deck.name.replace(/#\d+$/, "").trim();
    let cloneNumber = 1;
    let newName = `${baseName} #${cloneNumber}`;
    try {
      const { getSavedDecks, addDeck } = await import("@/lib/userDatabase");
      if (!db) return;
      const allDecks = await getSavedDecks(db);
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
      const cards = (deck as any).cards ? (deck as any).cards : "[]";
      await addDeck(db, newName, deck.thumbnail || undefined, cards);
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
      // Find the new deck by name and navigate to it
      const updatedDecks = await getSavedDecks(db);
      const newDeck = updatedDecks.find((d) => d.name === newName);
      if (newDeck) {
        router.replace(`/decks/${newDeck.id}`);
      }
    } catch (e) {
      console.error("Failed to clone deck", e);
    }
  };

  const handleDeletePress = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deckId || !db) return;
    try {
      await db.runAsync(`DELETE FROM Decks WHERE id = ?`, [Number(deckId)]);
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
      router.replace("/deckbuilder");
    } catch (error) {
      console.error("Error deleting deck:", error);
    } finally {
      setShowModal(false);
    }
  };

  const handleEditPress = () => {
    if (!deck) return;
    setEditName(deck.name);
    setEditThumbnail(deck.thumbnail || "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!deckId || !db || saving) return;
    setSaving(true);
    try {
      await db.runAsync(`UPDATE Decks SET name = ?, thumbnail = ? WHERE id = ?`, [
        editName,
        editThumbnail,
        Number(deckId),
      ]);
      const updatedDeck = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
      setDeck(updatedDeck);
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating deck:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailSelect = async (cardId: string) => {
    if (!cardDb) return;
    try {
      const card = await cardDb.getFirstAsync<{ imagesLarge: string }>(
        "SELECT imagesLarge FROM Card WHERE cardId = ?",
        [cardId]
      );
      if (card && card.imagesLarge) {
        setEditThumbnail(card.imagesLarge);
      }
    } catch (e) {
      console.error("Error fetching card image for thumbnail:", e);
    }
  };

  return (
    <>
      <MainScrollView
        headerImage="deck-bkg"
        headerTitle={deck?.name || "Deck Details"}
        scrollRef={scrollRef}
      >
        <View>
          {loading || dbLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.purple}
              style={{ marginTop: 200 }}
            />
          ) : error ? (
            <ThemedText>Error loading deck: {error.message}</ThemedText>
          ) : deck ? (
            <>
              <AddCardToDeck
                deck={deck}
                db={db}
                onCardAdded={async () => {
                  // Refresh deck after card is added
                  if (db) {
                    const updatedDeck = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
                    setDeck(updatedDeck);
                  }
                }}
              />
              <ThemedView
                style={{
                  marginBottom: getCardsArray().length > 0 ? theme.padding.large * -1.5 : theme.padding.large,
                  paddingBottom: getCardsArray().length > 0 ? theme.padding.xlarge : undefined,
                }}
              >
                {/* Toggle Button */}
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
                    deckId={Number(deckId)}
                    onCardsChanged={async () => {
                      if (db) {
                        const updatedDeck = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
                        setDeck(updatedDeck);
                        if (typeof incrementDecksVersion === "function") incrementDecksVersion();
                      }
                    }}
                  />
                ) : (
                  <DeckThumbnailList
                    cards={cardDetails}
                    deckId={Number(deckId)}
                    onCardsChanged={async () => {
                      if (db) {
                        const updatedDeck = await db.getFirstAsync<any>(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
                        setDeck(updatedDeck);
                        if (typeof incrementDecksVersion === "function") incrementDecksVersion();
                      }
                    }}
                  />
                )}
                {/* Import/Export Buttons and Modal */}
              </ThemedView>
              {deck && cardDb && db && (
                <ThemedView
                  style={{
                    marginTop: getCardsArray().length > 0 ? undefined : theme.padding.medium,
                    marginBottom: theme.padding.large,
                  }}
                >
                  <View
                    style={{
                      flexWrap: "wrap",
                      flexDirection: "row",
                      justifyContent: "center",
                      paddingVertical: theme.padding.medium,
                    }}
                  >
                    <DeckImportExport
                      deck={deck}
                      cardDb={cardDb}
                      db={db}
                      getCardsArray={getCardsArray}
                      setDeck={setDeck}
                      decksVersion={decksVersion}
                      deckId={deckId}
                    />
                    <ThemedButton
                      title="Clone"
                      type="main"
                      size="small"
                      onPress={handleCloneDeck}
                      style={{ marginHorizontal: theme.padding.xsmall }}
                    />
                    <ThemedButton
                      title="Edit"
                      type="main"
                      size="small"
                      onPress={handleEditPress}
                      style={{ marginHorizontal: theme.padding.xsmall }}
                    />
                    <ThemedButton
                      title="Delete"
                      type="alternative"
                      size="small"
                      onPress={handleDeletePress}
                      style={{ marginHorizontal: theme.padding.xsmall }}
                    />
                  </View>
                </ThemedView>
              )}
              <ThemedModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmDelete}
                buttonText="Delete"
                buttonType="main"
                buttonSize="large"
                onCancelText="Cancel"
                onCancel={() => setShowModal(false)}
              >
                <ThemedText
                  type="h2"
                  color={theme.colors.white}
                  style={{ marginTop: theme.padding.small, marginBottom: theme.padding.medium, textAlign: "center" }}
                >
                  Delete Deck?
                </ThemedText>
                <ThemedText
                  color={theme.colors.grey}
                  style={{ textAlign: "center", paddingBottom: theme.padding.small }}
                >
                  Are you sure you want to delete '{deck?.name}'? This action cannot be undone.
                </ThemedText>
              </ThemedModal>
              <ThemedModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onConfirm={handleSaveEdit}
                buttonText={saving ? "Saving..." : "Save"}
                buttonType="main"
                buttonSize="large"
                onCancelText="Cancel"
                onCancel={() => setEditModalVisible(false)}
                disabled={!editName.trim() || saving}
              >
                <CardAutoCompleteProvider>
                  <ThemedText
                    type="h2"
                    color={theme.colors.white}
                    style={{ marginTop: theme.padding.small, marginBottom: theme.padding.medium, textAlign: "center" }}
                  >
                    Edit Deck
                  </ThemedText>
                  <ThemedTextInput
                    value={editName}
                    onChange={setEditName}
                    placeholder="Enter deck name"
                    style={{ marginBottom: theme.padding.medium }}
                  />
                  <CardAutoCompleteInput
                    key={deck?.id}
                    value={editThumbnail}
                    onCardSelect={handleThumbnailSelect}
                    placeholder="Type card name (min 3 chars)"
                    maxChars={25}
                    resetKey={deck?.id}
                  />
                  <CardAutoCompleteSuggestions onCardSelect={handleThumbnailSelect} />
                </CardAutoCompleteProvider>
              </ThemedModal>
              <ThemedModal
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onConfirm={async () => {
                  setImporting(true);
                  setImporting(false);
                  setImportModalVisible(false);
                }}
                buttonText={importing ? "Importing..." : "Import"}
                buttonType="main"
                buttonSize="large"
                onCancelText="Cancel"
                onCancel={() => setImportModalVisible(false)}
                disabled={importing}
              >
                <ThemedText
                  type="h2"
                  color={theme.colors.white}
                  style={{ marginTop: theme.padding.small, marginBottom: theme.padding.medium, textAlign: "center" }}
                >
                  Import Deck
                </ThemedText>
                <ThemedTextInput
                  value={importText}
                  onChange={setImportText}
                  placeholder="Paste deck text here"
                  style={{ minHeight: 120, marginBottom: theme.padding.medium, textAlignVertical: "top" }}
                />
              </ThemedModal>
            </>
          ) : (
            <ThemedText>Deck not found.</ThemedText>
          )}
        </View>
      </MainScrollView>
    </>
  );
}
