import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, FlatList, TextInput } from "react-native";
import { Svg, Polygon, Path } from "react-native-svg";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedText from "@/components/base/ThemedText";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";
import { getSavedDecks, increaseCardQuantity } from "@/lib/userDatabase";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/deckbuilder/AddToDeckModalStyle";

interface AddToDeckDropdownProps {
  cardId: string;
  cardName?: string;
  onAdded?: (deckId: number) => void;
  triggerButtonStyle?: any;
}

export default function AddToDeckModal({ cardId, cardName, onAdded, triggerButtonStyle }: AddToDeckDropdownProps) {
  const { db } = useUserDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [addingDeckId, setAddingDeckId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [deckId: number]: number }>({});
  const [search, setSearch] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (modalVisible && db) {
      getSavedDecks(db).then((decks) => {
        setDecks(decks);
        // Preload current quantities for this card in each deck
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
      });
    }
  }, [modalVisible, db, cardId]);

  const handleAdd = async (deckId: number) => {
    if (!db) return;
    setAddingDeckId(deckId);
    try {
      if (quantities[deckId] < 4) {
        await increaseCardQuantity(db, deckId, cardId);
        setQuantities((q) => ({ ...q, [deckId]: Math.min((q[deckId] || 0) + 1, 4) }));
        if (onAdded) onAdded(deckId);
      }
    } finally {
      setAddingDeckId(null);
    }
  };

  // Filter decks by search
  const filteredDecks = decks.filter((deck) => deck.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Add to Deck"
        style={styles.addButtonTrigger}
      >
        <View style={styles.button}>
          <View style={styles.iconContainerStyle}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 326.06 326.06"
            >
              <Polygon
                points="306.5 119.6 206.46 119.6 206.46 19.56 119.6 19.56 119.6 119.6 19.56 119.6 19.56 206.46 119.6 206.46 119.6 306.5 206.46 306.5 206.46 206.46 306.5 206.46 306.5 119.6"
                fill="#fff"
              />
              <Path
                d="M192.38,20v113.68h113.68v58.7h-113.68v113.68h-58.7v-113.68H20v-58.7h113.68V20h58.7m-.32-20h-58.38c-11.05,0-20,8.95-20,20V113.68H20c-11.05,0-20,8.95-20,20v58.7c0,11.05,8.95,20,20,20H113.68v93.68c0,11.05,8.95,20,20,20h58.7c11.05,0,20-8.95,20-20v-93.68h93.68c11.05,0,20-8.95,20-20v-58.7c0-11.05-8.95-20-20-20h-93.68V20c0-11.67-9.09-20-20.32-20Z"
                fill="#fff"
              />
            </Svg>
          </View>
        </View>
      </TouchableOpacity>
      <ThemedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        buttonText="Close"
        buttonType="main"
        buttonSize="large"
        contentStyle={{ minWidth: 320, maxWidth: 400 }}
      >
        <ThemedText
          type="subtitle"
          style={{ marginBottom: theme.padding.small, textAlign: "center" }}
        >
          Add {cardName ? `'${cardName}'` : "card"} to Deck
        </ThemedText>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search decks..."
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        <FlatList
          data={filteredDecks}
          keyExtractor={(item) => item.id.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.deckRow}>
              <ThemedText style={styles.deckName}>{item.name}</ThemedText>
              <View style={styles.qtyBox}>
                <ThemedText style={styles.qtyText}>{quantities[item.id] || 0}/4</ThemedText>
                <TouchableOpacity
                  onPress={() => handleAdd(item.id)}
                  disabled={quantities[item.id] >= 4 || addingDeckId === item.id}
                  style={[
                    styles.addButton,
                    {
                      opacity: quantities[item.id] >= 4 || addingDeckId === item.id ? 0.5 : 1,
                    },
                  ]}
                  accessibilityLabel={`Add to ${item.name}`}
                >
                  <Svg
                    width={20}
                    height={20}
                    viewBox="0 0 326.06 326.06"
                  >
                    <Polygon
                      points="306.5 119.6 206.46 119.6 206.46 19.56 119.6 19.56 119.6 119.6 19.56 119.6 19.56 206.46 119.6 206.46 119.6 306.5 206.46 306.5 206.46 206.46 306.5 206.46 306.5 119.6"
                      fill="#fff"
                    />
                    <Path
                      d="M192.38,20v113.68h113.68v58.7h-113.68v113.68h-58.7v-113.68H20v-58.7h113.68V20h58.7m-.32-20h-58.38c-11.05,0-20,8.95-20,20V113.68H20c-11.05,0-20,8.95-20,20v58.7c0,11.05,8.95,20,20,20H113.68v93.68c0,11.05,8.95,20,20,20h58.7c11.05,0,20-8.95,20-20v-93.68h93.68c11.05,0,20-8.95,20-20v-58.7c0-11.05-8.95-20-20-20h-93.68V20c0-11.67-9.09-20-20.32-20Z"
                      fill="#fff"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<ThemedText style={{ textAlign: "center", marginTop: 16 }}>No decks found.</ThemedText>}
          style={{ maxHeight: 320, minWidth: 260 }}
        />
      </ThemedModal>
    </>
  );
}
