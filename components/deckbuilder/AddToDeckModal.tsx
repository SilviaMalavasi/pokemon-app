import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Pressable, Modal, TextInput } from "react-native";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { getSavedDecks } from "@/lib/userDatabase";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedSelect from "@/components/base/ThemedSelect";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/deckbuilder/AddToDeckModalStyle";

interface AddToDeckDropdownProps {
  cardId: string;
  cardName?: string;
  onAdded?: (deckId: number) => void;
  supertype?: string;
  subtypes?: string[];
}

export default function AddToDeckModal({ cardId, cardName, onAdded, supertype, subtypes }: AddToDeckDropdownProps) {
  const { db, workingDeckId, setWorkingDeckId, incrementDecksVersion, error } = useUserDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [deckPickerVisible, setDeckPickerVisible] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [addingDeckId, setAddingDeckId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [deckId: number]: number }>({});
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>(undefined);
  const [stagedQuantity, setStagedQuantity] = useState<number>(0);
  const [newDeckModalVisible, setNewDeckModalVisible] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckThumbnail, setNewDeckThumbnail] = useState("");
  const [autoCompleteKey, setAutoCompleteKey] = useState(0);
  const cardDb = useCardDatabase().db;

  // Compute maxQuantity based on supertype and subtypes
  let maxQuantity = 4;
  if (supertype === "Energy" && Array.isArray(subtypes) && subtypes.includes("Basic")) {
    maxQuantity = 60;
  }

  useEffect(() => {
    if (!modalVisible) return;
    if (!db) {
      setDecks([]);
      setQuantities({});
      setStagedQuantity(0);
      return;
    }
    getSavedDecks(db).then((decks) => {
      setDecks(decks);
      const q: { [deckId: number]: number } = {};
      decks.forEach((deck) => {
        try {
          const arr = Array.isArray(deck.cards) ? deck.cards : JSON.parse(deck.cards || "[]");
          const found = arr.find((c: any) => c.cardId === cardId);
          q[deck.id] = found ? found.quantity : 0;
        } catch {
          q[deck.id] = 0;
        }
      });
      setQuantities(q);
      if (decks.length > 0) {
        const initialDeckId = workingDeckId || String(decks[0].id);
        setSelectedDeckId(initialDeckId);
        if (!workingDeckId) setWorkingDeckId(initialDeckId);
        const deckObj = decks.find((d) => String(d.id) === initialDeckId);
        setStagedQuantity(deckObj ? q[deckObj.id] : 0);
      }
    });
  }, [modalVisible, db, cardId]);

  useEffect(() => {
    // When deck changes, update stagedQuantity
    if (!modalVisible) return;
    const deckId = workingDeckId || selectedDeckId;
    const deckIdNum = deckId ? Number(deckId) : undefined;
    if (deckIdNum !== undefined && deckIdNum in quantities) {
      setStagedQuantity(quantities[deckIdNum]);
    } else if (deckIdNum !== undefined) {
      setStagedQuantity(0);
    }
  }, [workingDeckId, selectedDeckId, quantities, modalVisible]);

  const handleCancel = () => {
    // Reset staged quantity to current DB value and close modal
    const deckId = workingDeckId || selectedDeckId;
    const deckIdNum = deckId ? Number(deckId) : undefined;
    if (deckIdNum !== undefined) {
      setStagedQuantity(quantities[deckIdNum] || 0);
    }
    setModalVisible(false);
  };

  // Handler to save card to deck
  const handleConfirmAdd = async () => {
    if (!db || !workingDeck) return;
    setAddingDeckId(workingDeck.id);
    try {
      // Get current cards array
      let cardsArr: any[] = [];
      try {
        cardsArr = Array.isArray(workingDeck.cards) ? workingDeck.cards : JSON.parse(workingDeck.cards || "[]");
      } catch {
        cardsArr = [];
      }
      // Remove existing entry for this cardId
      const filtered = cardsArr.filter((c: any) => c.cardId !== cardId);
      // Only add if quantity > 0
      if (stagedQuantity > 0) {
        filtered.push({ cardId, quantity: stagedQuantity });
      }
      await db.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(filtered), workingDeck.id]);
      setQuantities((prev) => ({ ...prev, [workingDeck.id]: stagedQuantity }));
      incrementDecksVersion(); // Notify context of deck change
      setModalVisible(false);
      if (onAdded) onAdded(workingDeck.id);
    } catch (e) {
      console.error("Error saving card to deck:", e);
    } finally {
      setAddingDeckId(null);
    }
  };

  // Handler to save card to deck and close modal
  const handleConfirmAndClose = async () => {
    await handleConfirmAdd();
    setModalVisible(false);
  };

  const handleCreateNewDeck = async () => {
    if (!db || !newDeckName.trim()) return;
    try {
      await db.runAsync("INSERT INTO Decks (name, cards, thumbnail) VALUES (?, ?, ?)", [
        newDeckName.trim(),
        JSON.stringify([]),
        newDeckThumbnail,
      ]);
      // Refresh decks and select the last one (newest)
      const updatedDecks = await getSavedDecks(db);
      const newDeck = updatedDecks[updatedDecks.length - 1];
      setDecks(updatedDecks);
      setSelectedDeckId(String(newDeck.id));
      setWorkingDeckId(String(newDeck.id));
      setQuantities((prev) => ({ ...prev, [newDeck.id]: 0 }));
      setStagedQuantity(0);
      setNewDeckModalVisible(false);
      setDeckPickerVisible(false);
      setNewDeckName("");
      setNewDeckThumbnail("");
      setAutoCompleteKey((k) => k + 1);
      incrementDecksVersion();
      // Set the new deck as default/last opened
      setWorkingDeckId(String(newDeck.id));
      setSelectedDeckId(String(newDeck.id));
    } catch (e) {
      console.error("Error creating new deck:", e);
    }
  };

  // Handler to select thumbnail by cardId
  const handleThumbnailSelect = async (cardId: string) => {
    if (!cardDb) return;
    try {
      const card = await cardDb.getFirstAsync<{ imagesLarge: string }>(
        "SELECT imagesLarge FROM Card WHERE cardId = ?",
        [cardId]
      );
      if (card && card.imagesLarge) {
        setNewDeckThumbnail(card.imagesLarge);
      }
    } catch (e) {
      console.error("Error fetching card image for thumbnail:", e);
    }
  };

  // Only show the working deck in the select and as the only visible deck
  const deckIdStr = workingDeckId || selectedDeckId;
  const workingDeck = decks.find((deck) => String(deck.id) === deckIdStr);
  const selectOptions = decks.map((deck: any) => ({ label: deck.name, value: String(deck.id) }));
  // Add a 'New Deck' option to the select options
  const selectOptionsWithNew = [...selectOptions, { label: "- New Deck -", value: "__new__" }];

  return (
    <>
      <ThemedButton
        type="main"
        size="small"
        title="Add to Deck"
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Add to Deck"
      />
      <ThemedModal
        visible={modalVisible}
        onClose={handleConfirmAndClose}
        onCancelText="Cancel"
        onCancel={handleCancel}
        buttonText={"Add to Deck"}
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
          to Deck
        </ThemedText>
        {!db ? (
          <>
            <ThemedText style={{ textAlign: "center", marginTop: 16, color: theme.colors.green }}>
              Database not available. Please try again later.
            </ThemedText>
            {error && (
              <ThemedText style={{ textAlign: "center", marginTop: 8, color: "red" }}>{error.message}</ThemedText>
            )}
          </>
        ) : (
          <>
            {/* Deck Picker Pressable and Modal */}
            <View style={styles.deckPickerContainer}>
              {selectOptions.length > 0 ? (
                <ThemedSelect
                  value={deckIdStr || ""}
                  options={selectOptionsWithNew}
                  onChange={(val) => {
                    if (val === "__new__") {
                      setNewDeckModalVisible(true);
                    } else if (typeof val === "string") {
                      setSelectedDeckId(val);
                      setWorkingDeckId(val);
                    }
                  }}
                  {...(!deckIdStr ? { label: "Select a Deck" } : {})}
                  labelHint="Select a Deck"
                />
              ) : (
                <ThemedButton
                  title="Create a Deck"
                  type="outline"
                  size="small"
                  onPress={() => setNewDeckModalVisible(true)}
                />
              )}
            </View>
            {/* End Deck Picker */}
            {workingDeck ? (
              <View style={styles.deckRow}>
                <ThemedText style={styles.deckName}>{workingDeck.name}</ThemedText>
                <View style={styles.qtyBox}>
                  <ThemedButton
                    title="-"
                    type="outline"
                    size="small"
                    onPress={() => setStagedQuantity((q) => Math.max(q - 1, 0))}
                    disabled={stagedQuantity <= 0 || addingDeckId === workingDeck.id}
                    style={styles.qtyOperator}
                    accessibilityLabel={`Remove from ${workingDeck.name}`}
                  />
                  <ThemedText style={[styles.qtyText, { textAlign: "center" }]}>
                    {stagedQuantity}
                    {!(supertype === "Energy" && Array.isArray(subtypes) && subtypes.includes("Basic")) && (
                      <>/{maxQuantity}</>
                    )}
                  </ThemedText>
                  <ThemedButton
                    title="+"
                    type="outline"
                    size="small"
                    onPress={() => setStagedQuantity((q) => Math.min(q + 1, maxQuantity))}
                    disabled={stagedQuantity >= maxQuantity || addingDeckId === workingDeck.id}
                    style={styles.qtyOperator}
                    accessibilityLabel={`Add to ${workingDeck.name}`}
                  />
                </View>
              </View>
            ) : null}
          </>
        )}
      </ThemedModal>
      {/* New Deck Modal */}
      <ThemedModal
        visible={newDeckModalVisible}
        onClose={handleCreateNewDeck}
        buttonText={"Create"}
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={() => setNewDeckModalVisible(false)}
      >
        <ThemedText
          type="h2"
          style={{ marginBottom: theme.padding.medium, textAlign: "center" }}
        >
          Create New Deck
        </ThemedText>
        <CardAutoCompleteProvider>
          <ThemedTextInput
            value={newDeckName}
            onChange={setNewDeckName}
            placeholder="Enter deck name"
            maxChars={25}
            style={{ marginBottom: theme.padding.medium }}
          />
          {cardDb ? (
            <>
              <CardAutoCompleteInput
                key={autoCompleteKey}
                value={newDeckThumbnail}
                onCardSelect={handleThumbnailSelect}
                placeholder="Type card name (min 3 chars)"
                maxChars={25}
                labelHint="Select a card image for the deck"
                resetKey={autoCompleteKey}
              />
              <CardAutoCompleteSuggestions onCardSelect={handleThumbnailSelect} />
            </>
          ) : null}
        </CardAutoCompleteProvider>
      </ThemedModal>
    </>
  );
}
