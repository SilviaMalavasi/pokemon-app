import React, { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BackHandler, ActivityIndicator, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import MainScrollView from "@/components/ui/MainScrollView";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import AddCardToWatchList from "@/components/deckbuilder/AddCardToWatchlist";
import WatchlistThumbnailList from "@/components/deckbuilder/WatchlistThumbnailList";
import ThemedView from "@/components/ui/ThemedView";
import { theme } from "@/style/ui/Theme";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import cardImages from "@/helpers/cardImageMapping";

export default function WatchListDetailScreen() {
  const router = useRouter();
  const { watchlistId, from } = useLocalSearchParams<{ watchlistId: string; from?: string }>();
  const {
    db,
    isLoading: dbLoading,
    error,
    watchLists,
    watchListsVersion,
    incrementWatchListsVersion,
  } = useUserDatabase();
  const { db: cardDb, isLoading: cardDbLoading } = useCardDatabase();
  const [watchList, setWatchList] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardDetails, setCardDetails] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!watchlistId || !db || !cardDb) return;
    const fetchWatchList = async () => {
      setLoading(true);
      try {
        const wl = await db.getFirstAsync<any>(`SELECT * FROM WatchedCards WHERE id = ?`, [Number(watchlistId)]);
        setWatchList(wl);
        // Fetch card details if cards exist
        let cardsArr = [];
        try {
          cardsArr = Array.isArray(wl?.cards) ? wl.cards : JSON.parse(wl?.cards || "[]");
        } catch {
          cardsArr = [];
        }
        if (cardsArr.length > 0) {
          const ids = cardsArr.map((c: any) => c.cardId);
          const placeholders = ids.map(() => "?").join(",");
          const details = await cardDb.getAllAsync<any>(
            `SELECT cardId, name, imagesLarge FROM Card WHERE cardId IN (${placeholders})`,
            ids
          );
          setCardDetails(details);
        } else {
          setCardDetails([]);
        }
      } catch (error) {
        console.warn("Error fetching watchList:", error);
        setWatchList(null);
        setCardDetails([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchList();
  }, [watchlistId, db, cardDb, watchListsVersion]);

  useEffect(() => {
    if (!db) return;
    // Optionally, you could add a fetch here if you want to refresh watchLists in this context
  }, [db, watchListsVersion]);

  // Helper to parse watchList.cards (stored as JSON string)
  const getCardsArray = () => {
    try {
      return Array.isArray(watchList?.cards) ? watchList.cards : JSON.parse(watchList?.cards || "[]");
    } catch {
      return [];
    }
  };

  const handleCloneWatchlist = async () => {
    if (!watchList || !db) return;
    let baseName = watchList.name.replace(/#\d+$/, "").trim();
    let cloneNumber = 1;
    let newName = `${baseName} #${cloneNumber}`;
    try {
      const allLists = await db.getAllAsync<any>("SELECT * FROM WatchedCards");
      const regex = new RegExp(`^${baseName} #(\\d+)$`);
      const usedNumbers = allLists
        .map((d: any) => {
          const match = d.name.match(regex);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((n: any) => n !== null);
      while (usedNumbers.includes(cloneNumber)) {
        cloneNumber++;
        newName = `${baseName} #${cloneNumber}`;
      }
      const cards = watchList.cards ? watchList.cards : "[]";
      await db.runAsync("INSERT INTO WatchedCards (name, cards) VALUES (?, ?)", [
        newName,
        typeof cards === "string" ? cards : JSON.stringify(cards),
      ]);
      incrementWatchListsVersion();
      // Optionally: refresh UI or navigate to new watchlist
    } catch (e) {
      console.error("Failed to clone watchlist", e);
    }
  };

  const handleEditWatchlist = () => {
    if (!watchList) return;
    setEditName(watchList.name);
    setEditThumbnail(watchList.thumbnail || "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!watchList || !db || saving) return;
    setSaving(true);
    try {
      await db.runAsync("UPDATE WatchedCards SET name = ?, thumbnail = ? WHERE id = ?", [
        editName,
        editThumbnail,
        watchList.id,
      ]);
      const updated = await db.getFirstAsync<any>(`SELECT * FROM WatchedCards WHERE id = ?`, [watchList.id]);
      setWatchList(updated);
      setEditModalVisible(false);
      incrementWatchListsVersion();
    } catch (e) {
      console.error("Error updating watchlist:", e);
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

  const handleDeleteWatchlist = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!watchList || !db) return;
    try {
      await db.runAsync("DELETE FROM WatchedCards WHERE id = ?", [watchList.id]);
      incrementWatchListsVersion();
      router.replace("/watchlist");
    } catch (e) {
      console.error("Error deleting watchlist:", e);
    } finally {
      setShowModal(false);
    }
  };

  // Handler for Android back button
  const handleBack = useCallback(() => {
    if (from === "home") {
      router.replace("/"); // Navigate to HomeScreen
    } else {
      router.replace("/watchlist"); // Default to WatchlistScreen
    }
    return true; // Indicate event was handled
  }, [from, router]);

  // Effect to attach and detach back button listener
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return handleBack();
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [handleBack])
  );

  // Handler to update context when cards are changed (e.g., card removed)
  const handleCardsChanged = () => {
    incrementWatchListsVersion();
  };

  return (
    <MainScrollView
      headerImage="watchlist-bkg"
      headerTitle={watchList?.name || "WatchList Details"}
    >
      <View>
        {loading || dbLoading || cardDbLoading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.purple}
            style={{ marginTop: 200 }}
          />
        ) : error ? (
          <ThemedText>Error loading watchlist: {error.message}</ThemedText>
        ) : watchList ? (
          <>
            <AddCardToWatchList
              watchlist={watchList}
              db={db}
              onCardAdded={async () => {
                // Refresh watchlist after card is added
                if (db) {
                  const updatedWatchList = await db.getFirstAsync<any>(`SELECT * FROM WatchedCards WHERE id = ?`, [
                    watchlistId,
                  ]);
                  setWatchList(updatedWatchList);
                  // Optionally refresh card details
                  let cardsArr = [];
                  try {
                    cardsArr = Array.isArray(updatedWatchList?.cards)
                      ? updatedWatchList.cards
                      : JSON.parse(updatedWatchList?.cards || "[]");
                  } catch {
                    cardsArr = [];
                  }
                  if (cardsArr.length > 0 && cardDb) {
                    const ids = cardsArr.map((c: any) => c.cardId);
                    const placeholders = ids.map(() => "?").join(",");
                    const details = await cardDb.getAllAsync<any>(
                      `SELECT cardId, name, imagesLarge FROM Card WHERE cardId IN (${placeholders})`,
                      ids
                    );
                    setCardDetails(details);
                  } else {
                    setCardDetails([]);
                  }
                }
              }}
            />
            <ThemedView style={{ marginBottom: theme.padding.large * -1.5 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: theme.padding.small,
                  marginBottom: theme.padding.large,
                }}
              >
                <ThemedText type="h2">Cards ({cardDetails.length})</ThemedText>
              </View>
              <WatchlistThumbnailList
                cards={getCardsArray()}
                watchlistId={Number(watchlistId)}
                db={db}
                onCardsChanged={handleCardsChanged}
              />
              <View style={{ marginBottom: theme.padding.xlarge }} />
            </ThemedView>
            <ThemedView
              layout="rounded"
              style={{ marginBottom: theme.padding.large }}
            >
              <ThemedButton
                title="Clone"
                type="main"
                size="small"
                onPress={handleCloneWatchlist}
              />
              <ThemedButton
                title="Edit"
                type="main"
                size="small"
                onPress={handleEditWatchlist}
              />
              <ThemedButton
                title="Delete"
                type="alternative"
                size="small"
                onPress={handleDeleteWatchlist}
              />
            </ThemedView>
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
                Delete Watchlist?
              </ThemedText>
              <ThemedText
                color={theme.colors.grey}
                style={{ textAlign: "center", paddingBottom: theme.padding.small }}
              >
                Are you sure you want to delete '{watchList?.name}'? This action cannot be undone.
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
                  Edit Watchlist
                </ThemedText>
                <ThemedTextInput
                  value={editName}
                  onChange={setEditName}
                  placeholder="Enter watchlist name"
                  style={{ marginBottom: theme.padding.medium }}
                />
                <CardAutoCompleteInput
                  key={watchList?.id}
                  value={editThumbnail}
                  onCardSelect={handleThumbnailSelect}
                  placeholder="Type card name (min 3 chars)"
                  maxChars={25}
                  resetKey={watchList?.id}
                />
                <CardAutoCompleteSuggestions onCardSelect={handleThumbnailSelect} />
              </CardAutoCompleteProvider>
            </ThemedModal>
          </>
        ) : (
          <ThemedText>Watchlist not found.</ThemedText>
        )}
      </View>
    </MainScrollView>
  );
}
