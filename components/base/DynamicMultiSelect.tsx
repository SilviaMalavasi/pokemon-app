import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import styles from "@/style/base/DynamicMultiSelectStyle";

interface DynamicMultiSelectProps {
  label?: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
  labelHint?: string;
}

export default function DynamicMultiSelect({
  label,
  value,
  options,
  onChange,
  labelHint,
}: DynamicMultiSelectProps): JSX.Element {
  const [showHint, setShowHint] = useState(false);
  const [pickerValue, setPickerValue] = useState<string | undefined>(undefined);

  // Toggle selection for multi-select
  const handleSelect = (selectedValue: string) => {
    let newValue: string[];
    if (value.includes(selectedValue)) {
      newValue = value.filter((v) => v !== selectedValue);
    } else {
      newValue = [...value, selectedValue];
    }
    onChange(newValue);
    setPickerValue(undefined); // Reset picker to placeholder
  };

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
      {/* Show selected items */}
      {value.length > 0 && (
        <View style={styles.selectedStyle}>
          {value.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <ThemedText
                key={val}
                style={styles.selectedItemText}
              >
                {opt ? opt.label : val}
              </ThemedText>
            );
          })}
        </View>
      )}
      {/* Picker for multi-select */}
      <Picker
        selectedValue={pickerValue}
        onValueChange={(itemValue) => {
          if (itemValue) handleSelect(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item
          label="Select..."
          value={undefined}
        />
        {options.map((option) => (
          <Picker.Item
            key={option.value}
            label={value.includes(option.value) ? `✓ ${option.label}` : option.label}
            value={option.value}
            color={value.includes(option.value) ? "#888" : undefined}
          />
        ))}
      </Picker>
      {showHint && labelHint && <ThemedText type="hintText">{labelHint}</ThemedText>}
    </ThemedView>
  );
}
