import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Svg, Path, Rect } from "react-native-svg";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/ui/FloatingEditStyle";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";

interface FloatingEditProps {
  deck: any;
  db: any;
  cardDb: any;
  setDeck: (deck: any) => void;
  deckId: string | number;
}

const FloatingEdit: React.FC<FloatingEditProps> = ({ deck, db, cardDb, setDeck, deckId }) => {
  const { incrementDecksVersion } = useUserDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [saving, setSaving] = useState(false);

  // Handler to select thumbnail by cardId (use cardDb)
  const handleThumbnailSelect = async (cardId: string) => {
    if (!cardDb) return;
    try {
      const card = await cardDb.getFirstAsync("SELECT imagesLarge FROM Card WHERE cardId = ?", [cardId]);
      if (card && card.imagesLarge) {
        setEditThumbnail(card.imagesLarge);
      }
    } catch (e) {
      console.error("Error fetching card image for thumbnail:", e);
    }
  };

  // Open modal and prefill fields
  const openEditModal = () => {
    setEditName(deck?.name || "");
    setEditThumbnail(deck?.thumbnail || "");
    setModalVisible(true);
  };

  // Save changes to DB
  const handleSaveEdit = async () => {
    if (!db || !deckId || !editName.trim()) return;
    setSaving(true);
    try {
      await db.runAsync("UPDATE Decks SET name = ?, thumbnail = ? WHERE id = ?", [
        editName,
        editThumbnail || null,
        Number(deckId),
      ]);
      // Refresh deck from DB to ensure thumbnail is up to date
      const updatedDeck = await db.getFirstAsync(`SELECT * FROM Decks WHERE id = ?`, [deckId]);
      setDeck(updatedDeck);
      incrementDecksVersion(); // Notify context/UI of deck change
      setModalVisible(false);
    } catch (e) {
      console.error("Error updating deck:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={openEditModal}
        activeOpacity={0.8}
      >
        <View style={styles.fabInnerView}>
          <View style={styles.fabIconView}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 328.86 328.57"
            >
              <Path d="M245.58,24.13l10.26-10.26c3.74-3.73,9.16-5.87,14.87-5.87s11.12,2.14,14.85,5.87l29.13,29.15c3.98,3.96,6.16,9.24,6.16,14.86s-2.19,10.88-6.17,14.87l-10.24,10.24-58.87-58.87Z" />
              <Path
                d="M270.71,16c3.6,0,6.96,1.29,9.19,3.53l29.15,29.17c2.45,2.44,3.8,5.71,3.8,9.19s-1.32,6.71-3.82,9.21l-4.59,4.59-47.55-47.55,4.59-4.59c2.25-2.25,5.61-3.54,9.22-3.54m0-16c-7.52,0-15.05,2.74-20.53,8.22l-15.91,15.91,70.18,70.18,15.91-15.91c5.47-5.49,8.5-12.78,8.5-20.52s-3.01-15.05-8.5-20.52l-29.13-29.15c-5.48-5.48-12.99-8.22-20.51-8.22h0Zm33.74,94.31h0s.02,0,.02,0h0Z"
                fill="#fff"
              />
              <Rect
                x="33.59"
                y="125.55"
                width="255.66"
                height="83.24"
                transform="translate(-70.93 163.1) rotate(-45)"
              />
              <Path
                d="M222.37,58.67l47.54,47.54L100.46,275.68l-47.54-47.54L222.37,58.67m0-20.56c-1.28,0-2.56,.49-3.54,1.46L33.82,224.6c-1.95,1.95-1.95,5.12,0,7.07l63.1,63.1c.98,.98,2.26,1.46,3.54,1.46s2.56-.49,3.54-1.46L292.55,106.21,225.91,39.58c-.98-.98-2.26-1.46-3.54-1.46h0Z"
                fill="#fff"
              />
              <Path d="M8.42,320.57c-.06,0-.19-.02-.29-.12-.12-.12-.16-.25-.12-.37l16.96-62.16,45.68,45.68-62.13,16.96-.1,.02Z" />
              <Path
                d="M29.07,273.32l26.19,26.19-36.01,9.83,9.83-36.01m-8.2-30.83l.02,.03L.3,317.95c-.8,2.92,.03,6.03,2.18,8.15,1.59,1.59,3.74,2.46,5.95,2.46,.74,0,1.48-.09,2.21-.3l75.42-20.58L20.87,242.5h0Z"
                fill="#fff"
              />
            </Svg>
          </View>
        </View>
      </TouchableOpacity>
      <ThemedModal
        visible={modalVisible}
        onClose={async () => {
          if (!saving && editName.trim()) {
            await handleSaveEdit();
          } else {
            setModalVisible(false);
          }
        }}
        buttonText={saving ? "Saving..." : "Save"}
        buttonType="main"
        buttonSize="large"
        buttonStyle={{ minWidth: 120 }}
        onCancelText="Cancel"
        onCancel={() => setModalVisible(false)}
        contentStyle={{ minWidth: 300 }}
      >
        <CardAutoCompleteProvider>
          <ThemedText type="subtitle">Edit Deck</ThemedText>
          <ThemedTextInput
            label="Deck Name *"
            value={editName}
            onChange={setEditName}
            placeholder="Enter deck name"
            style={{ marginBottom: theme.padding.medium }}
          />
          <CardAutoCompleteInput
            label="Deck Thumbnail"
            value={editThumbnail}
            onCardSelect={handleThumbnailSelect}
            placeholder="Type card name (min 3 chars)"
            labelHint="Select a card image for the deck"
          />
          <CardAutoCompleteSuggestions onCardSelect={handleThumbnailSelect} />
        </CardAutoCompleteProvider>
      </ThemedModal>
    </>
  );
};

export default FloatingEdit;
