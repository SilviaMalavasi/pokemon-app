import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { TextInput as RNTextInput } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import styles from "@/style/base/ThemedTextInputStyle";

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  labelHint?: string;
}

export default function ThemedTextInput({
  label,
  value,
  onChange,
  placeholder,
  labelHint,
}: TextInputProps): JSX.Element {
  const [showHint, setShowHint] = useState(false);

  return (
    <ThemedView style={styles.container}>
      {label && (
        <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
          <ThemedText
            type="label"
            style={styles.label}
          >
            {label}
          </ThemedText>
          {labelHint && (
            <TouchableOpacity
              onPress={() => setShowHint((v) => !v)}
              accessibilityLabel={`Hint for ${label}`}
            >
              <ThemedText type="hintIcon">?</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      )}
      {showHint && labelHint && <ThemedText type="hintText">{labelHint}</ThemedText>}
      <ThemedView>
        <RNTextInput
          style={[styles.input, { flex: 1 }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChange("")}
            accessibilityLabel={`Clear ${label || "input"}`}
            style={styles.clearIcon}
          >
            <ThemedText type="hintIcon">X</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
}
