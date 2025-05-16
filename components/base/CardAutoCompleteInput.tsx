import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";

import styles from "@/style/base/CardAutoCompleteInputStyle";

// Card suggestion type
export type CardSuggestion = { id: number; name: string; imagesLarge: string; cardId: string };

interface CardAutoCompleteContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  suggestions: CardSuggestion[];
  setSuggestions: (s: CardSuggestion[]) => void;
  inputFocused: boolean;
  setInputFocused: (b: boolean) => void;
  selectedCardName: string | null;
  setSelectedCardName: (n: string | null) => void;
  handleSearch: (text: string) => void;
  selectingSuggestion: React.MutableRefObject<boolean>;
  inputRef: React.RefObject<TextInput>;
}

const CardAutoCompleteContext = createContext<CardAutoCompleteContextType | undefined>(undefined);

export function useCardAutoComplete() {
  const ctx = useContext(CardAutoCompleteContext);
  if (!ctx) throw new Error("useCardAutoComplete must be used within CardAutoCompleteProvider");
  return ctx;
}

export function CardAutoCompleteProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const selectingSuggestion = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const { db, isLoading: dbLoading } = useCardDatabase();
  const [selectedCardName, setSelectedCardName] = useState<string | null>(null);

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    setSelectedCardName(null);
    if (dbLoading || !db) {
      setSuggestions([]);
      return;
    }
    if (text.length > 2) {
      try {
        const results = await db.getAllAsync<CardSuggestion>(
          "SELECT id, name, imagesLarge, cardId FROM Card WHERE name LIKE ? ORDER BY name LIMIT 10",
          [`${text}%`]
        );
        setSuggestions(results);
      } catch (error) {
        console.error("[CardAutoCompleteInput] Error in handleSearch:", error, { db, dbLoading, text });
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <CardAutoCompleteContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        suggestions,
        setSuggestions,
        inputFocused,
        setInputFocused,
        selectedCardName,
        setSelectedCardName,
        handleSearch,
        selectingSuggestion,
        inputRef: inputRef as React.RefObject<TextInput>,
      }}
    >
      {children}
    </CardAutoCompleteContext.Provider>
  );
}

export function CardAutoCompleteSuggestions({ onCardSelect }: { onCardSelect: (cardId: string) => void }) {
  const {
    suggestions,
    setSearchTerm,
    setSelectedCardName,
    setSuggestions,
    setInputFocused,
    selectingSuggestion,
    inputRef,
    selectedCardName,
    inputFocused,
  } = useCardAutoComplete();

  const showSuggestions = inputFocused && suggestions.length > 0 && !selectedCardName;

  if (!showSuggestions) return null;

  return (
    <ScrollView
      style={styles.suggestionsListContainer}
      keyboardShouldPersistTaps="always"
    >
      {suggestions.map((card) => (
        <Pressable
          key={card.id}
          onTouchStart={() => {
            selectingSuggestion.current = true;
          }}
          onTouchEnd={() => {
            onCardSelect(card.cardId);
            setSearchTerm(card.name);
            setSelectedCardName(card.name);
            setSuggestions([]);
            setInputFocused(false);
            selectingSuggestion.current = false;
            if (inputRef.current) {
              inputRef.current.blur();
            }
          }}
          accessibilityLabel={`Select card ${card.name}`}
        >
          <ThemedText style={styles.customItem}>
            {card.name} <ThemedText type="hintText">{card.cardId.toUpperCase()}</ThemedText>
          </ThemedText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

interface CardAutoCompleteInputProps {
  label?: string;
  value: string;
  onCardSelect: (cardId: string) => void;
  placeholder?: string;
  labelHint?: string;
  resetKey?: number; // Add resetKey prop
  maxChars?: number; // Optional: max characters to display (with ellipsis)
}

export default function CardAutoCompleteInput({
  label,
  value,
  placeholder,
  labelHint,
  resetKey,
  maxChars,
}: CardAutoCompleteInputProps) {
  const {
    searchTerm,
    setSearchTerm,
    setSelectedCardName,
    handleSearch,
    inputRef,
    setInputFocused,
    selectingSuggestion,
    selectedCardName,
  } = useCardAutoComplete();

  useEffect(() => {
    if (value && !searchTerm) {
      setSelectedCardName("Selected Card");
    }
  }, [value]);

  // Clear searchTerm when resetKey changes
  useEffect(() => {
    setSearchTerm("");
    setSelectedCardName(null);
  }, [resetKey]);

  return (
    <ThemedTextInput
      ref={inputRef}
      value={searchTerm}
      maxChars={maxChars}
      onChange={(text) => {
        setSearchTerm(text);
        setSelectedCardName(null);
        handleSearch(text);
      }}
      placeholder={placeholder || ""}
      labelHint={labelHint}
      onFocus={() => {
        selectingSuggestion.current = false;
        setInputFocused(true);
        if (selectedCardName) {
          setSearchTerm("");
          setSelectedCardName(null);
        }
      }}
      onBlur={() => {
        setTimeout(() => {
          if (!selectingSuggestion.current) {
            setInputFocused(false);
          }
        }, 250);
      }}
    />
  );
}
