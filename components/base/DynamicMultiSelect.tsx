import React, { useRef } from "react";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import { MultiSelect } from "react-native-element-dropdown";
import styles from "@/style/base/DynamicMultiSelectStyle";

interface DynamicMultiSelectProps {
  label?: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
}

export default function DynamicMultiSelect({ label, value, options, onChange }: DynamicMultiSelectProps): JSX.Element {
  const dropdownRef = useRef<any>(null);

  const handleChange = (selected: string[]) => {
    console.log("DynamicMultiSelect handleChange", { label, selected });
    onChange(selected);
    dropdownRef.current?.close();
  };

  return (
    <ThemedView style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
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
