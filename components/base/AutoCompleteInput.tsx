import React, { useState, useRef, useEffect } from "react";
import { View, TextInput as RNTextInput, ScrollView, TouchableOpacity, Keyboard } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import AutoCompleteInputStyle from "@/style/base/AutoCompleteInputStyle";

interface AutoCompleteInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  style?: any;
  labelHint?: string;
}

export default function AutoCompleteInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  labelHint,
}: AutoCompleteInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const isSelecting = useRef(false);

  // Filter suggestions case-insensitively
  const filteredSuggestions = suggestions.filter(
    (s) => value.length === 0 || s.toLowerCase().includes(value.toLowerCase())
  );

  const handleSelect = (item: string) => {
    console.log("[AutoCompleteInput] Dropdown item clicked:", item);
    console.log("[AutoCompleteInput] handleSelect", item);
    onChange(item);
    setShowDropdown(false);
    Keyboard.dismiss();
    isSelecting.current = false;
    console.log("[AutoCompleteInput] Dropdown closed after select");
  };

  const handleChange = (text: string) => {
    console.log("[AutoCompleteInput] handleChange", text);
    onChange(text);
    setShowDropdown(true);
    console.log("[AutoCompleteInput] Dropdown opened after change");
  };

  const handleFocus = () => {
    setShowDropdown(true);
    console.log("[AutoCompleteInput] Input focused, dropdown opened");
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!isSelecting.current) {
        setShowDropdown(false);
        console.log("[AutoCompleteInput] Input blurred, dropdown closed");
      } else {
        console.log("[AutoCompleteInput] Input blurred, but selection in progress");
      }
    }, 100);
  };

  useEffect(() => {
    console.log("[AutoCompleteInput] value prop changed:", value);
    console.log("[AutoCompleteInput] filteredSuggestions:", filteredSuggestions);
  }, [value, filteredSuggestions]);

  useEffect(() => {
    console.log("[AutoCompleteInput] showDropdown:", showDropdown);
  }, [showDropdown]);

  return (
    <ThemedView style={AutoCompleteInputStyle.container}>
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
      <ThemedView style={AutoCompleteInputStyle.inputWrapper}>
        <RNTextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={AutoCompleteInputStyle.placeholder.color}
          style={[AutoCompleteInputStyle.input, { flex: 1 }]}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChange("")}
            accessibilityLabel={`Clear ${label || "input"}`}
            style={AutoCompleteInputStyle.clearIcon}
          >
            <ThemedText type="hintIcon">×</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
      {showDropdown && filteredSuggestions.length > 0 && (
        <View style={[AutoCompleteInputStyle.dropdown, { position: "relative", marginTop: 4 }]}>
          <ScrollView keyboardShouldPersistTaps="always">
            {filteredSuggestions.map((item) => (
              <TouchableOpacity
                key={item}
                onPressIn={() => {
                  isSelecting.current = true;
                  console.log("[AutoCompleteInput] onPressIn for item:", item);
                }}
                onPress={() => {
                  console.log("[AutoCompleteInput] onPress for item:", item);
                  handleSelect(item);
                  setTimeout(() => {
                    isSelecting.current = false;
                  }, 150);
                }}
                style={AutoCompleteInputStyle.dropdownItem}
              >
                <ThemedText>{item}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ThemedView>
  );
}
