import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { TextInput as RNTextInput } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import styles from "@/style/base/NumberInputStyle";

interface NumberInputProps {
  label?: string;
  value: number | "";
  onChange: (value: number | "", operator: string) => void;
  placeholder?: string;
  labelHint?: string;
  showOperatorSelect?: "none" | "basic" | "advanced";
}

export default function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  labelHint,
  showOperatorSelect = "none",
}: NumberInputProps): JSX.Element {
  const [showHint, setShowHint] = useState(false);
  const [currentOperator, setCurrentOperator] = useState("=");

  const handleOperatorChange = (item: { label: string; value: string }) => {
    setCurrentOperator(item.value);
    onChange(value, item.value);
  };

  let operatorOptions: { label: string; value: string }[] = [];
  if (showOperatorSelect === "basic") {
    operatorOptions = [
      { label: "=", value: "=" },
      { label: "≥", value: ">=" },
      { label: "≤", value: "<=" },
    ];
  } else if (showOperatorSelect === "advanced") {
    operatorOptions = [
      { label: "=", value: "=" },
      { label: "≥", value: ">=" },
      { label: "≤", value: "<=" },
      { label: "+", value: "+" },
      { label: "x", value: "x" },
    ];
  }

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
      <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
        {showOperatorSelect !== "none" && (
          <Dropdown
            data={operatorOptions}
            value={currentOperator}
            onChange={handleOperatorChange}
            labelField="label"
            valueField="value"
            style={styles.picker}
            containerStyle={styles.listContainer}
            itemContainerStyle={styles.listContainer}
            itemTextStyle={styles.listItem}
            placeholder={""}
            selectedTextStyle={styles.selected}
            renderRightIcon={() => null}
          />
        )}
        <RNTextInput
          style={[styles.input, { flex: 1 }]}
          value={value === "" ? "" : String(value)}
          onChangeText={(text) => {
            if (text === "") {
              onChange("", currentOperator);
            } else {
              const cleaned = text.replace(/[^0-9]/g, "");
              const num = Number(cleaned);
              if (!isNaN(num) && num >= 0) {
                onChange(num, currentOperator);
              } else if (cleaned === "") {
                onChange("", currentOperator);
              }
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          keyboardType="numeric"
          inputMode="numeric"
          returnKeyType="done"
        />
      </ThemedView>
    </ThemedView>
  );
}
