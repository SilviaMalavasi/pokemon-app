import React, { useState, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
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
  // Only show suggestions if input is focused and at least one suggestion starts with the input value (case-insensitive)
  const filteredSuggestions =
    inputFocused && value ? suggestions.filter((s) => s.toLowerCase().startsWith(value.toLowerCase())) : suggestions;
  const showSuggestions = inputFocused && filteredSuggestions.length > 0;

  return (
    <ThemedView style={styles.container}>
      {showSuggestions && (
        <View style={styles.suggestionsListContainer}>
          <ThemedText
            type="label"
            style={styles.suggestionLabel}
          >
            Are you searchig for...
          </ThemedText>
          {filteredSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              onPress={() => {
                onChange(suggestion);
                setInputFocused(false);
              }}
              accessibilityLabel={`Select suggestion ${suggestion}`}
            >
              <ThemedText style={styles.customItem}>{suggestion}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <ThemedTextInput
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ""}
        labelHint={labelHint}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
      />
    </ThemedView>
  );
}
