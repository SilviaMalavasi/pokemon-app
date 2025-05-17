import React, { useState, useRef } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedTextInput from "@/components/base/ThemedTextInput";

import styles from "@/style/base/AutoCompleteInputStyle";

interface AutoCompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  labelHint?: string;
}

export default function AutoCompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  labelHint,
}: AutoCompleteInputProps) {
  const [inputFocused, setInputFocused] = useState(false);
  const selectingSuggestion = useRef(false); // Use ref to track if a suggestion is being selected
  const inputRef = useRef<TextInput>(null);

  const filteredSuggestions =
    inputFocused && value ? suggestions.filter((s) => s.toLowerCase().startsWith(value.toLowerCase())) : suggestions;
  const showSuggestions = inputFocused && filteredSuggestions.length > 0;

  return (
    // Apply padding conditionally here
    <View style={styles.container}>
      {showSuggestions && (
        <ScrollView
          style={styles.suggestionsListContainer}
          keyboardShouldPersistTaps="always"
        >
          <ThemedText
            type="label"
            style={styles.suggestionLabel}
          >
            Are you searchig for...
          </ThemedText>
          {filteredSuggestions.map((suggestion) => {
            return (
              <Pressable
                key={suggestion}
                // Use touch events to set/reset the flag
                onTouchStart={() => {
                  selectingSuggestion.current = true;
                }}
                onTouchEnd={() => {
                  // Trigger action directly on TouchEnd
                  onChange(suggestion);
                  setInputFocused(false); // Hide suggestions after selection
                  selectingSuggestion.current = false; // Reset flag after action
                }}
                accessibilityLabel={`Select suggestion ${suggestion}`}
              >
                <ThemedText style={styles.customItem}>{suggestion}</ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <ThemedTextInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ""}
        labelHint={labelHint}
        onFocus={() => {
          selectingSuggestion.current = false;
          setInputFocused(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            if (!selectingSuggestion.current) {
              setInputFocused(false);
            }
          }, 250);
        }}
      />
    </View>
  );
}
