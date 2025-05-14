import React, { useState } from "react";
import { TouchableOpacity, View, Modal } from "react-native";
import Svg, { Path } from "react-native-svg";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { addWatchList } from "@/lib/userDatabase";
import { Pressable } from "react-native";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";

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
        setError("Please select or create a watchlist.");
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
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Add to WatchList"
        style={styles.addButtonTrigger}
      >
        <View style={styles.iconContainerStyle}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 392.83 393.19"
          >
            <Path
              d="M314.38,246.32c-2.92,3.32-4.28,7.74-3.73,12.13l11.06,93.3c1.19,10.07-3.2,19.98-11.46,25.86-4.69,3.28-10.27,5.04-15.99,5.06-4.22,0-8.37-1.01-12.13-2.93l-78.77-38.92c-4.23-1.92-9.09-1.92-13.33,0l-79.04,39.45c-9.05,4.56-19.87,3.74-28.12-2.13-8.26-5.88-12.66-15.79-11.46-25.86l11.06-93.3c.55-4.39-.81-8.81-3.73-12.13L17.02,176.88c-10.18-11.43-9.17-28.96,2.26-39.14,3.63-3.23,8.04-5.45,12.8-6.44l87.03-17.59c4.62-.81,8.6-3.72,10.8-7.86L172.3,24.8c7.14-13.54,23.91-18.74,37.45-11.6,4.95,2.61,8.99,6.65,11.6,11.6l41.85,81.04c2.14,4.08,6.01,6.97,10.53,7.86l86.9,17.59c15,3.05,24.69,17.69,21.64,32.69-.97,4.79-3.2,9.24-6.44,12.89l-61.44,69.44Z"
              stroke="#fff"
              strokeMiterlimit={10}
              strokeWidth={20}
            />
          </Svg>
        </View>
        <ThemedText type="h4">WatchList</ThemedText>
      </TouchableOpacity>
      <ThemedModal
        visible={modalVisible}
        onClose={handleAddToWatchListAndClose}
        buttonText={"Add"}
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setModalVisible(false)}
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
              <ThemedLabelWithHint
                style={styles.deckPickerLabel}
                label="Select a WatchList"
              />
              <Pressable
                onPress={() => setWatchListPickerVisible(true)}
                style={styles.pickerWrapper}
              >
                <ThemedText
                  color={
                    watchLists.length === 0 || !watchLists.find((wl) => wl.id === selectedWatchListId)
                      ? theme.colors.grey
                      : theme.colors.purple
                  }
                >
                  {(() => {
                    const selected = watchLists.find((wl) => wl.id === selectedWatchListId);
                    return selected ? selected.name : "Select";
                  })()}
                </ThemedText>
              </Pressable>
              <Modal
                visible={watchListPickerVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setWatchListPickerVisible(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setWatchListPickerVisible(false)}
                >
                  <Pressable
                    style={styles.modalContainer}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <View style={{ paddingBottom: theme.padding.xsmall }}>
                      {watchLists.map((wl) => (
                        <Pressable
                          key={wl.id}
                          onPress={() => {
                            setSelectedWatchListId(wl.id);
                            setLastWatchListId(wl.id);
                            setWatchListPickerVisible(false);
                          }}
                        >
                          <ThemedText style={selectedWatchListId === wl.id ? styles.selectedOperator : styles.operator}>
                            {wl.name}
                          </ThemedText>
                        </Pressable>
                      ))}
                      <Pressable
                        key={-1}
                        onPress={() => {
                          setShowNewListModal(true);
                          setWatchListPickerVisible(false);
                        }}
                      >
                        <ThemedText style={styles.operator}>- New Watchlist -</ThemedText>
                      </Pressable>
                    </View>
                    <Pressable
                      onPress={() => setWatchListPickerVisible(false)}
                      style={styles.modalCancel}
                    >
                      <ThemedText style={{ color: theme.colors.grey }}>Cancel</ThemedText>
                    </Pressable>
                  </Pressable>
                </Pressable>
              </Modal>
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
        buttonStyle={isSaving ? { opacity: 0.5 } : undefined}
      >
        <ThemedText style={{ marginBottom: theme.padding.small, marginTop: theme.padding.small, textAlign: "center" }}>
          Enter a name for your new watchlist
        </ThemedText>
        <ThemedTextInput
          value={newListName}
          label="New Watchlist Name"
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
