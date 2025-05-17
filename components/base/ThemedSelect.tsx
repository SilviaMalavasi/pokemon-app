import React, { useState } from "react";
import { View, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { Svg, Rect, Path } from "react-native-svg";
import ThemedText from "@/components/base/ThemedText";
import ThemedChip from "@/components/base/ThemedChip";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedButton from "@/components/base/ThemedButton";

import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedSelectStyle";

interface ThemedSelectProps {
  label?: string;
  value: string | string[];
  options: { value: string; label: string }[];
  onChange: (value: string | string[]) => void;
  labelHint?: string;
  style?: any;
}

export default function ThemedSelect({ label, value, options, onChange, labelHint, style }: ThemedSelectProps) {
  const [showHint, setShowHint] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setModalVisible(false);
  };

  const cancelSelection = () => {
    setModalVisible(false);
  };

  return (
    <>
      <View style={[styles.wrapper, style]}>
        <View style={styles.fakeInnerShadow} />
        <View>
          {labelHint && (
            <ThemedLabelWithHint
              labelHint={labelHint}
              showHint={showHint}
              setShowHint={setShowHint}
            />
          )}
          {/* Modal-based single-select */}
          <Pressable
            onPress={() => setModalVisible(true)}
            style={styles.pickerWrapper}
          >
            {!value ? (
              <ThemedText style={styles.selectPressable}>{label}</ThemedText>
            ) : (
              <ThemedText
                style={styles.selectPressable}
                color={theme.colors.green}
              >
                {options.find((o) => o.value === value)?.label || label}
              </ThemedText>
            )}
          </Pressable>
          <ThemedModal
            visible={modalVisible}
            onClose={cancelSelection}
            buttonText="Cancel"
            buttonType="alternative"
            buttonSize="small"
            onConfirm={cancelSelection}
          >
            <View style={styles.modalContainer}>
              {options.map((option) => (
                <ThemedButton
                  key={option.value}
                  title={option.label}
                  type="outline"
                  size="small"
                  onPress={() => handleSelect(option.value)}
                  style={styles.operator}
                />
              ))}
            </View>
          </ThemedModal>
        </View>
      </View>
      <View style={styles.selectedAndHintWrapper}>
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
