import React, { useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import { MultiSelect } from "react-native-element-dropdown";
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
  const dropdownRef = useRef<any>(null);
  const [showHint, setShowHint] = useState(false);

  const handleChange = (selected: string[]) => {
    console.log("DynamicMultiSelect handleChange", { label, selected });
    onChange(selected);
    dropdownRef.current?.close();
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
      {showHint && labelHint && <ThemedText type="hintText">{labelHint}</ThemedText>}
      <MultiSelect
        ref={dropdownRef}
        style={styles.picker}
        placeholderStyle={styles.picker}
        selectedTextStyle={styles.selectedItemText}
        inputSearchStyle={styles.inputSearchStyle}
        containerStyle={styles.listContainer}
        itemContainerStyle={styles.listContainer}
        itemTextStyle={styles.listItem}
        selectedStyle={styles.selectedStyle}
        search
        data={options}
        labelField="label"
        valueField="value"
        placeholder="Select..."
        searchPlaceholder="Search..."
        value={value}
        onChange={handleChange}
      />
    </ThemedView>
  );
}
