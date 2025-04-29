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
  const showSuggestions = inputFocused && suggestions.length > 0;

  return (
    <ThemedView style={styles.container}>
      <ThemedTextInput
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ""}
        labelHint={labelHint}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
      />
      {showSuggestions && (
        <View style={styles.suggestionsListContainer}>
          {suggestions.map((suggestion) => (
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
    </ThemedView>
  );
}
