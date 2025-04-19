import React from "react";
import { TextInput as RNTextInput } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import styles from "@/style/base/TextInputStyle";

interface NumberInputProps {
  label?: string;
  value: number | "";
  onChange: (value: number | "") => void;
  placeholder?: string;
}

export default function NumberInput({ label, value, onChange, placeholder }: NumberInputProps): JSX.Element {
  return (
    <ThemedView style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <RNTextInput
        style={styles.input}
        value={value === "" ? "" : String(value)}
        onChangeText={(text) => {
          // Only allow numbers >= 0, step 1
          if (text === "") {
            onChange("");
          } else {
            // Remove non-digit characters
            const cleaned = text.replace(/[^0-9]/g, "");
            const num = Number(cleaned);
            if (!isNaN(num) && num >= 0) {
              onChange(num);
            } else if (cleaned === "") {
              onChange("");
            }
          }
        }}
        placeholder={placeholder}
        placeholderTextColor="#888"
        keyboardType="numeric"
        inputMode="numeric"
        returnKeyType="done"
      />
    </ThemedView>
  );
}
