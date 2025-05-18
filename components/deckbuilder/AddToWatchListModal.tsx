import React, { useState } from "react";
import { TouchableOpacity, View, Modal } from "react-native";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addWatchList } from "@/lib/userDatabase";
import { Pressable } from "react-native";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import ThemedSelect from "@/components/base/ThemedSelect";
import styles from "@/style/deckbuilder/AddToWatchListModalStyle";
import { theme } from "@/style/ui/Theme";

interface AddToWatchListModalProps {
  cardId: string;
  cardName: string;
  onAdded?: (watchListId: number) => void;
}

export default function AddToWatchListModal({ cardId, cardName, onAdded }: AddToWatchListModalProps) {
  const { db, watchLists, incrementWatchListsVersion, lastWatchListId, setLastWatchListId } = useUserDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWatchListId, setSelectedWatchListId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [watchListPickerVisible, setWatchListPickerVisible] = useState(false);

  React.useEffect(() => {
    if (modalVisible && watchLists.length > 0) {
      setSelectedWatchListId(lastWatchListId ?? watchLists[0].id);
    }
  }, [modalVisible, watchLists, lastWatchListId]);

  // Handler for main modal (add card to watchlist)
  const handleAddToWatchListAndClose = async () => {
    if (!db) return;
    setIsSaving(true);
    setError(null);
    try {
      let targetId = selectedWatchListId;
      if (!targetId && newListName.trim()) {
        // Create new watchlist with this card only
        const res = await addWatchList(db, newListName.trim(), JSON.stringify([{ cardId }]));
        targetId = res.lastInsertRowId;
        await incrementWatchListsVersion();
      } else if (targetId) {
        // Add card to existing watchlist if not present
        const wl = watchLists.find((w) => w.id === targetId);
        if (!wl) throw new Error("Watchlist not found");
        let cardsArr = [];
        try {
          cardsArr = Array.isArray(wl.cards) ? wl.cards : JSON.parse(wl.cards || "[]");
        } catch {
          cardsArr = [];
        }
        // Avoid duplicates
        if (!cardsArr.some((c: any) => c.cardId === cardId)) {
          cardsArr.push({ cardId });
          await db.runAsync("UPDATE WatchedCards SET cards = ? WHERE id = ?", [JSON.stringify(cardsArr), targetId]);
          await incrementWatchListsVersion();
        } else {
          setError("Card already in this watchlist.");
          setIsSaving(false);
          return;
        }
      } else {
        setIsSaving(false);
        return;
      }
      setLastWatchListId(targetId!);
      setModalVisible(false);
      setIsSaving(false);
      setNewListName("");
      setSelectedWatchListId(null);
      if (onAdded && targetId) onAdded(targetId);
    } catch (e: any) {
      setError(e.message || "Error adding to watchlist");
      setIsSaving(false);
    }
  };

  // Handler for new watchlist modal (create new watchlist)
  const handleCreateNewWatchListAndClose = async () => {
    if (isSaving) return; // Prevent double submit
    if (!db || !newListName.trim()) {
      setShowNewListModal(false);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      // Prepare the WatchedCards table if not already present
      if (db.prepareAsync) {
        await db.prepareAsync(
          "CREATE TABLE IF NOT EXISTS WatchedCards (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, cards TEXT)"
        );
      }
      const res = await addWatchList(db, newListName.trim(), JSON.stringify([]));
      await incrementWatchListsVersion(); // Await in case it's async
      setLastWatchListId(res.lastInsertRowId);
      setSelectedWatchListId(res.lastInsertRowId);
      setIsSaving(false);
      setNewListName("");
      setShowNewListModal(false); // Only close the new list modal after context update
    } catch (e: any) {
      setError(e.message || "Error creating watchlist");
      setIsSaving(false);
    }
  };

  return (
    <>
      <ThemedButton
        type="main"
        size="small"
        title="Add to Watched"
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Add to Watched"
      />
      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleAddToWatchListAndClose}
        buttonText="Add"
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        disabled={isSaving || !!error}
      >
        <ThemedText
          type="h4"
          style={{ marginBottom: theme.padding.large, textAlign: "center" }}
        >
          Add{" "}
          {cardName ? (
            <ThemedText
              type="h4"
              color={theme.colors.green}
            >
              {cardName}
            </ThemedText>
          ) : (
            "card"
          )}{" "}
          to WatchList
        </ThemedText>
        {!db ? (
          <ThemedText style={{ textAlign: "center", marginTop: theme.padding.large, color: theme.colors.green }}>
            Database not available. Please try again later.
          </ThemedText>
        ) : (
          <>
            <View style={styles.deckPickerContainer}>
              <ThemedSelect
                value={selectedWatchListId ? String(selectedWatchListId) : ""}
                options={[
                  ...watchLists.map((wl) => ({ label: wl.name, value: String(wl.id) })),
                  { label: "- New Watchlist -", value: "__new__" },
                ]}
                onChange={(val) => {
                  if (val === "__new__") {
                    setShowNewListModal(true);
                  } else if (typeof val === "string") {
                    setSelectedWatchListId(Number(val));
                    setLastWatchListId(Number(val));
                  }
                }}
                labelHint="Select a WatchList"
                {...(!selectedWatchListId ? { label: "Select a WatchList" } : {})}
              />
            </View>
          </>
        )}
      </ThemedModal>
      {/* New Watchlist Name Modal */}
      <ThemedModal
        visible={showNewListModal}
        onClose={handleCreateNewWatchListAndClose}
        buttonText={isSaving ? "Creating..." : "Create"}
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => !isSaving && setShowNewListModal(false)}
      >
        <ThemedText style={{ marginBottom: theme.padding.small, marginTop: theme.padding.small, textAlign: "center" }}>
          Enter a name for your new watchlist
        </ThemedText>
        <ThemedTextInput
          value={newListName}
          onChange={setNewListName}
          placeholder="Watchlist name"
        />
        {error &&
          (() => {
            console.warn(error);
            return null;
          })()}
      </ThemedModal>
    </>
  );
}
