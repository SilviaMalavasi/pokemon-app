import React, { useState, useEffect } from "react";
import { View, Modal, ScrollView, Pressable } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedChip from "@/components/base/ThemedChip";
import ThemedView from "@/components/base/ThemedView";
import ThemedCheckbox from "@/components/base/ThemedCheckbox";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedMultiSelectStyle";

interface ThemedMultiSelectProps {
  label?: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
  labelHint?: string;
}

export default function ThemedMultiSelect({
  label,
  value,
  options,
  onChange,
  labelHint,
}: ThemedMultiSelectProps): JSX.Element {
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
    <ThemedView style={styles.wrapper}>
      <ThemedView style={styles.container}>
        {label && (
          <ThemedLabelWithHint
            label={label}
            labelHint={labelHint}
            showHint={showHint}
            setShowHint={setShowHint}
          />
        )}
        {/* Modal-based multi-select */}
        <Pressable
          onPress={() => setModalVisible(true)}
          style={styles.pickerWrapper}
        >
          <ThemedText style={styles.selectPressable}>Select</ThemedText>
        </Pressable>
        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={cancelSelection}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView>
                {options.map((option) => (
                  <ThemedCheckbox
                    key={option.value}
                    checked={tempSelected.includes(option.value)}
                    label={option.label}
                    onPress={() => handleSelect(option.value)}
                  />
                ))}
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={cancelSelection}
                    style={styles.modalActionCancel}
                  >
                    <ThemedText
                      style={{
                        color: theme.colors.placeholder,
                        paddingVertical: theme.padding.medium,
                      }}
                    >
                      Cancel
                    </ThemedText>
                  </Pressable>
                  <Pressable onPress={confirmSelection}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ paddingVertical: theme.padding.medium, paddingHorizontal: theme.padding.small }}
                    >
                      OK
                    </ThemedText>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ThemedView>
      <ThemedView style={styles.selectedAndHintWrapper}>
        {/* Show selected items */}
        {value.length > 0 && (
          <ThemedView style={styles.selectedWrapper}>
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
          </ThemedView>
        )}
        {showHint && labelHint && (
          <ThemedText
            type="hintText"
            style={styles.labelHint}
          >
            {labelHint}
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}
