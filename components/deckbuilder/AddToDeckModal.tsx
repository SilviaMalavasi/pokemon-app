import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Pressable, Modal } from "react-native";
import { Svg, Polygon, Path } from "react-native-svg";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { getSavedDecks } from "@/lib/userDatabase";
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
  const { db, workingDeckId, setWorkingDeckId, incrementDecksVersion } = useUserDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [deckPickerVisible, setDeckPickerVisible] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [addingDeckId, setAddingDeckId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [deckId: number]: number }>({});
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>(undefined);
  const [stagedQuantity, setStagedQuantity] = useState<number>(0);

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

  // Only show the working deck in the select and as the only visible deck
  const deckIdStr = workingDeckId || selectedDeckId;
  const workingDeck = decks.find((deck) => String(deck.id) === deckIdStr);
  const selectOptions = decks.map((deck: any) => ({ label: deck.name, value: String(deck.id) }));

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Add to Deck"
        style={styles.addButtonTrigger}
      >
        <View style={styles.iconContainerStyle}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 326.06 326.06"
          >
            <Polygon points="306.5 119.6 206.46 119.6 206.46 19.56 119.6 19.56 119.6 119.6 19.56 119.6 19.56 206.46 119.6 206.46 119.6 306.5 206.46 306.5 206.46 206.46 306.5 206.46 306.5 119.6" />
            <Path
              d="M192.38,20v113.68h113.68v58.7h-113.68v113.68h-58.7v-113.68H20v-58.7h113.68V20h58.7m-.32-20h-58.38c-11.05,0-20,8.95-20,20V113.68H20c-11.05,0-20,8.95-20,20v58.7c0,11.05,8.95,20,20,20H113.68v93.68c0,11.05,8.95,20,20,20h58.7c11.05,0,20-8.95,20-20v-93.68h93.68c11.05,0,20-8.95,20-20v-58.7c0-11.05-8.95-20-20-20h-93.68V20c0-11.67-9.09-20-20.32-20Z"
              fill="#fff"
            />
          </Svg>
        </View>
        <ThemedText type="defaultSemiBold">Deck</ThemedText>
      </TouchableOpacity>
      <ThemedModal
        visible={modalVisible}
        onClose={handleConfirmAndClose}
        buttonText="Add to Deck"
        buttonType="main"
        buttonSize="large"
        onCancelText="Cancel"
        onCancel={handleCancel}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{ marginBottom: theme.padding.large, textAlign: "center" }}
        >
          Add{" "}
          {cardName ? (
            <ThemedText
              type="defaultSemiBold"
              color={theme.colors.textHilight}
            >
              {cardName}
            </ThemedText>
          ) : (
            "card"
          )}{" "}
          to Deck
        </ThemedText>
        {!db ? (
          <ThemedText style={{ textAlign: "center", marginTop: 16, color: theme.colors.primary }}>
            Database not available. Please try again later.
          </ThemedText>
        ) : (
          <>
            {/* Deck Picker Pressable and Modal */}
            <View style={styles.deckPickerContainer}>
              <ThemedLabelWithHint
                style={styles.deckPickerLabel}
                label="Select a Deck"
              />
              <Pressable
                onPress={() => setDeckPickerVisible(true)}
                style={styles.pickerWrapper}
              >
                <ThemedText color={theme.colors.textAlternative}>
                  {(() => {
                    const selected = selectOptions.find((o: any) => o.value === deckIdStr);
                    return selected ? selected.label : "Select";
                  })()}
                </ThemedText>
              </Pressable>
              <Modal
                visible={deckPickerVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setDeckPickerVisible(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setDeckPickerVisible(false)}
                >
                  <Pressable
                    style={styles.modalContainer}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <View style={{ paddingBottom: theme.padding.xsmall }}>
                      {/* Render deck options as rows */}
                      {decks.map((deck) => (
                        <Pressable
                          key={deck.id}
                          onPress={async () => {
                            setSelectedDeckId(String(deck.id));
                            setWorkingDeckId(String(deck.id));
                            setDeckPickerVisible(false);
                          }}
                        >
                          <ThemedText
                            style={
                              workingDeckId === String(deck.id) || selectedDeckId === String(deck.id)
                                ? styles.selectedOperator
                                : styles.operator
                            }
                          >
                            {deck.name}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                    <Pressable
                      onPress={() => setDeckPickerVisible(false)}
                      style={styles.modalCancel}
                    >
                      <ThemedText style={{ color: theme.colors.placeholder }}>Cancel</ThemedText>
                    </Pressable>
                  </Pressable>
                </Pressable>
              </Modal>
            </View>
            {/* End Deck Picker */}
            {workingDeck ? (
              <View style={styles.deckRow}>
                <ThemedText style={styles.deckName}>{workingDeck.name}</ThemedText>
                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    onPress={() => setStagedQuantity((q) => Math.max(q - 1, 0))}
                    disabled={stagedQuantity <= 0 || addingDeckId === workingDeck.id}
                    style={{
                      opacity: stagedQuantity <= 0 || addingDeckId === workingDeck.id ? 0.5 : 1,
                      marginRight: 8,
                    }}
                    accessibilityLabel={`Remove from ${workingDeck.name}`}
                  >
                    <ThemedText
                      style={styles.qtyOperator}
                      type="defaultSemiBold"
                    >
                      -
                    </ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={[styles.qtyText, { textAlign: "center" }]}>
                    {stagedQuantity}
                    {!(supertype === "Energy" && Array.isArray(subtypes) && subtypes.includes("Basic")) && (
                      <>/{maxQuantity}</>
                    )}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setStagedQuantity((q) => Math.min(q + 1, maxQuantity))}
                    disabled={stagedQuantity >= maxQuantity || addingDeckId === workingDeck.id}
                    style={{
                      opacity: stagedQuantity >= maxQuantity || addingDeckId === workingDeck.id ? 0.5 : 1,
                    }}
                    accessibilityLabel={`Add to ${workingDeck.name}`}
                  >
                    <ThemedText
                      style={styles.qtyOperator}
                      type="defaultSemiBold"
                    >
                      +
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ThemedModal>
    </>
  );
}
