import React, { useState, useRef, useEffect } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";

import styles from "@/style/base/CardAutoCompleteInputStyle";

interface CardAutoCompleteInputProps {
  label?: string;
  value: string;
  onCardSelect: (imagesLarge: string) => void;
  placeholder?: string;
  labelHint?: string;
}

export default function CardAutoCompleteInput({
  label,
  value,
  onCardSelect,
  placeholder,
  labelHint,
}: CardAutoCompleteInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<{ id: number; name: string; imagesLarge: string }[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const selectingSuggestion = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const { db } = useCardDatabase();
  const [selectedCardName, setSelectedCardName] = useState<string | null>(null);

  useEffect(() => {
    if (value && !searchTerm) {
      setSelectedCardName("Selected Card");
    }
  }, [value]);

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    if (!db) {
      setSuggestions([]);
      return;
    }
    if (text.length > 2) {
      try {
        // Query the Card table for matching names (case-insensitive, partial match)
        const results = await db.getAllAsync<{ id: number; name: string; imagesLarge: string }>(
          "SELECT id, name, imagesLarge FROM Card WHERE name LIKE ? ORDER BY name LIMIT 10",
          [`%${text}%`]
        );
        setSuggestions(results);
      } catch (error) {
        console.error("Failed to fetch card suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const showSuggestions = inputFocused && suggestions.length > 0 && !selectedCardName;

  return (
    <ThemedView style={styles.container}>
      {showSuggestions && (
        <ScrollView
          style={styles.suggestionsListContainer}
          keyboardShouldPersistTaps="always"
        >
          <ThemedText
            type="label"
            style={styles.suggestionLabel}
          >
            Suggestions:
          </ThemedText>
          {suggestions.map((card) => (
            <Pressable
              key={card.id}
              onTouchStart={() => {
                selectingSuggestion.current = true;
              }}
              onTouchEnd={() => {
                onCardSelect(card.imagesLarge);
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
              <ThemedText style={styles.customItem}>{card.name}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <ThemedTextInput
        ref={inputRef}
        label={label}
        value={selectedCardName || searchTerm} // Show selected card name or current search term
        onChange={handleSearch} // Corrected to onChange
        placeholder={placeholder || ""}
        labelHint={labelHint}
        onFocus={() => {
          selectingSuggestion.current = false;
          setInputFocused(true);
          if (selectedCardName) {
            setSearchTerm(""); // Clear search term to allow new search
            setSelectedCardName(null);
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            if (!selectingSuggestion.current) {
              setInputFocused(false);
              if (!selectedCardName && searchTerm) {
              }
            }
          }, 250);
        }}
      />
    </ThemedView>
  );
}
