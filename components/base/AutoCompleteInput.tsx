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
  const inputRef = useRef<TextInput>(null);

  const filteredSuggestions =
    inputFocused && value ? suggestions.filter((s) => s.toLowerCase().startsWith(value.toLowerCase())) : suggestions;
  const showSuggestions = inputFocused && filteredSuggestions.length > 0;

  return (
    <ThemedView style={styles.container}>
      {showSuggestions && (
        <ScrollView
          style={styles.suggestionsListContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText
            type="label"
            style={styles.suggestionLabel}
          >
            Are you searchig for...
          </ThemedText>
          {filteredSuggestions.map((suggestion) => {
            console.log("Rendering suggestion:", suggestion);
            return (
              <Pressable
                key={suggestion}
                onPress={() => {
                  console.log("Selected suggestion (Pressable):", suggestion);
                  onChange(suggestion);
                  setInputFocused(false);
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
        onFocus={() => setInputFocused(true)}
        onBlur={() => setTimeout(() => setInputFocused(false), 100)}
      />
    </ThemedView>
  );
}
