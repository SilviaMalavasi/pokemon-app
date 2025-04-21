import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { TextInput as RNTextInput } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import styles from "@/style/base/TextInputStyle";

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  labelHint?: string;
}

export default function TextInput({ label, value, onChange, placeholder, labelHint }: TextInputProps): JSX.Element {
  const [showHint, setShowHint] = useState(false);

  return (
    <ThemedView style={styles.container}>
      {label && (
        <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
          <ThemedText style={styles.label}>{label}</ThemedText>
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
      <RNTextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={styles.placeholder.color}
      />
    </ThemedView>
  );
}
