import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedChip from "@/components/base/ThemedChip";
import ThemedCheckbox from "@/components/base/ThemedCheckbox";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import ThemedModal from "@/components/base/ThemedModal";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedMultiSelectStyle";

interface ThemedMultiSelectProps {
  label?: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
  labelHint?: string;
  style?: any;
}

export default function ThemedMultiSelect({
  label,
  value,
  options,
  onChange,
  labelHint,
  style,
}: ThemedMultiSelectProps) {
  const [showHint, setShowHint] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(value);

  const handleSelect = (selectedValue: string) => {
    if (tempSelected.includes(selectedValue)) {
      setTempSelected(tempSelected.filter((v) => v !== selectedValue));
    } else {
      setTempSelected([...tempSelected, selectedValue]);
    }
  };

  const confirmSelection = () => {
    onChange(tempSelected);
    setModalVisible(false);
  };

  const cancelSelection = () => {
    setTempSelected(value);
    setModalVisible(false);
  };

  // Sync tempSelected with value when value changes (e.g., chip unselect)
  useEffect(() => {
    setTempSelected(value);
  }, [value]);

  return (
    <>
      <View style={[styles.wrapper, style]}>
        <View style={styles.fakeInnerShadow} />
        {labelHint && (
          <ThemedLabelWithHint
            labelHint={labelHint}
            setShowHint={setShowHint}
            showHint={showHint}
            style={{ top: theme.padding.medium }}
          />
        )}
        <Pressable
          onPress={() => setModalVisible(true)}
          style={styles.pickerWrapper}
        >
          <ThemedText style={styles.selectPressable}>{label}</ThemedText>
        </Pressable>
        <ThemedModal
          visible={modalVisible}
          onClose={cancelSelection}
          buttonText="Set"
          buttonType="main"
          buttonSize="small"
          onCancelText="Cancel"
          onCancel={cancelSelection}
          onConfirm={confirmSelection}
        >
          <View style={styles.modalContainer}>
            {options.map((option) => (
              <ThemedCheckbox
                key={option.value}
                checked={tempSelected.includes(option.value)}
                label={option.label}
                onPress={() => handleSelect(option.value)}
              />
            ))}
          </View>
        </ThemedModal>
      </View>
      <View style={styles.selectedAndHintWrapper}>
        {/* Show selected items */}
        {value.length > 0 && (
          <View style={styles.selectedWrapper}>
            {options
              .filter((o) => value.includes(o.value))
              .map((opt) => (
                <ThemedChip
                  key={opt.value}
                  label={opt.label}
                  icon="clear"
                  onPress={() => onChange(value.filter((v) => v !== opt.value))}
                  selected
                />
              ))}
          </View>
        )}
        {showHint && labelHint && (
          <ThemedText
            type="hintText"
            style={styles.labelHint}
          >
            {labelHint}
          </ThemedText>
        )}
      </View>
    </>
  );
}
