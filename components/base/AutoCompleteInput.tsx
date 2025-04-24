import React, { useState, useRef, useEffect, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import type { IAutocompleteDropdownRef } from "react-native-autocomplete-dropdown";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import AutoCompleteInputStyle from "@/style/base/AutoCompleteInputStyle";
import { Colors } from "@/style/Colors";

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
  const [showHint, setShowHint] = useState(false);
  const dropdownController = useRef<IAutocompleteDropdownRef | null>(null);

  // Memoize dataSet for performance
  const dataSet = useMemo(() => suggestions.map((item) => ({ id: item, title: item })), [suggestions]);

  // Custom handler to close dropdown if not in list and always fire onChange
  const handleChangeText = (text: string) => {
    onChange(text); // Always pass value to parent
    if (!suggestions.some((s) => s.toLowerCase() === text.toLowerCase())) {
      dropdownController.current?.close();
    }
  };

  return (
    <ThemedView>
      {label && (
        <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
          <ThemedText style={AutoCompleteInputStyle.label}>{label}</ThemedText>
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
      <AutocompleteDropdown
        controller={(controller) => {
          dropdownController.current = controller;
        }}
        clearOnFocus={false}
        onSelectItem={(item) => onChange(item?.title || "")}
        dataSet={dataSet}
        suggestionsListMaxHeight={200}
        renderItem={(item) => <ThemedText style={AutoCompleteInputStyle.customItem}>{item.title}</ThemedText>}
        onRightIconComponentPress={() => {
          dropdownController.current?.toggle();
        }}
        showChevron={false}
        textInputProps={{
          placeholder: placeholder || "",
          autoCorrect: false,
          autoCapitalize: "none",
          value: value,
          placeholderTextColor: Colors.placeholder,
          onChangeText: handleChangeText,
        }}
        inputContainerStyle={AutoCompleteInputStyle.inputContainer}
        suggestionsListContainerStyle={AutoCompleteInputStyle.suggestionsListContainer}
        suggestionsListTextStyle={AutoCompleteInputStyle.suggestionsListText}
        closeOnBlur={true}
        showClear={true}
        ClearIconComponent={<ThemedText type="hintIcon">×</ThemedText>}
        onClear={() => onChange("")}
      />
    </ThemedView>
  );
}
