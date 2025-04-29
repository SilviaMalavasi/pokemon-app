import React, { useState, useRef } from "react";
import { Pressable, ScrollView, TextInput } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import ThemedTextInput from "@/components/base/ThemedTextInput";

import styles from "@/style/base/AutoCompleteInputStyle";

interface AutoCompleteInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  labelHint?: string;
}

export default function AutoCompleteInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  labelHint,
}: AutoCompleteInputProps): JSX.Element {
  const [inputFocused, setInputFocused] = useState(false);
  const selectingSuggestion = useRef(false); // Use ref to track if a suggestion is being selected
  const inputRef = useRef<TextInput>(null);

  const filteredSuggestions =
    inputFocused && value ? suggestions.filter((s) => s.toLowerCase().startsWith(value.toLowerCase())) : suggestions;
  const showSuggestions = inputFocused && filteredSuggestions.length > 0;

  return (
    // Apply padding conditionally here
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
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ""}
        labelHint={labelHint}
        onFocus={() => {
          selectingSuggestion.current = false;
          setInputFocused(true);
        }}
        // Delay blur check and respect the flag
        onBlur={() => {
          setTimeout(() => {
            if (!selectingSuggestion.current) {
              setInputFocused(false);
            }
          }, 250); // Keep delay for now
        }}
      />
    </ThemedView>
  );
}
