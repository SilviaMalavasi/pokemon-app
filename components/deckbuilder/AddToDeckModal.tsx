import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
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
  const { db: userDb, workingDeckId, setWorkingDeckId, incrementDecksVersion, error, isLoading } = useUserDatabase();
  // Wait for userDb to be ready before rendering anything
  if (isLoading || !userDb) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={theme.colors.purple}
        />
      </View>
    );
  }

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
    if (!userDb) {
      setDecks([]);
      setQuantities({});
      setStagedQuantity(0);
      return;
    }
    getSavedDecks(userDb).then((decks) => {
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
  }, [modalVisible, userDb, cardId]);

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
    if (!userDb || !workingDeck) return;
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
      await userDb.runAsync("UPDATE Decks SET cards = ? WHERE id = ?", [JSON.stringify(filtered), workingDeck.id]);
      setQuantities((prev) => ({ ...prev, [workingDeck.id]: stagedQuantity }));
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
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
    if (!userDb || !newDeckName.trim()) return;
    try {
      await userDb.runAsync("INSERT INTO Decks (name, cards, thumbnail) VALUES (?, ?, ?)", [
        newDeckName.trim(),
        JSON.stringify([]),
        newDeckThumbnail,
      ]);
      // Refresh decks and select the last one (newest)
      const updatedDecks = await getSavedDecks(userDb);
      const newDeck = updatedDecks[updatedDecks.length - 1];
      setDecks(updatedDecks);
      setSelectedDeckId(String(newDeck.id));
      setWorkingDeckId(String(newDeck.id));
      setQuantities((prev) => ({ ...prev, [newDeck.id]: 0 }));
      if (typeof incrementDecksVersion === "function") incrementDecksVersion();
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
        onClose={() => setModalVisible(false)}
        onCancel={handleCancel}
        onConfirm={handleConfirmAndClose}
        buttonText="Add"
        disabled={addingDeckId !== null}
        onCancelText="Cancel"
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
        {!userDb ? (
          <>
            {error && (
              <ThemedText style={{ textAlign: "center", marginTop: 16, color: theme.colors.green }}>
                Database not available. Please try again later.
              </ThemedText>
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
