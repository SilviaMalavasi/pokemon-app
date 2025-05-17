import React, { useState } from "react";
import { View, Modal, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { Svg, Rect, Path } from "react-native-svg";
import ThemedText from "@/components/base/ThemedText";
import ThemedChip from "@/components/base/ThemedChip";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";

import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedSelectStyle";

interface ThemedSelectProps {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  labelHint?: string;
}

export default function ThemedSelect({ label, value, options, onChange, labelHint }: ThemedSelectProps) {
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
    <View style={styles.wrapper}>
      {!value && (
        <View style={styles.container}>
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
            <ThemedText style={styles.selectPressable}>
              {options.find((o) => o.value === value)?.label || "Select"}
            </ThemedText>
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
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                    >
                      <ThemedText style={styles.operator}>{option.label}</ThemedText>
                    </Pressable>
                  ))}
                  <View style={styles.modalActions}>
                    <Pressable
                      onPress={cancelSelection}
                      style={styles.modalActionCancel}
                    >
                      <ThemedText style={{ color: theme.colors.grey }}>Cancel</ThemedText>
                    </Pressable>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      )}
      <View style={styles.selectedAndHintWrapper}>
        {/* Show selected item */}
        {value && (
          <>
            {labelHint ? (
              <TouchableOpacity
                onPress={() => setShowHint(!showHint)}
                accessibilityLabel={`Hint for ${label}`}
                style={styles.touchableOpacity}
                activeOpacity={1}
              >
                <ThemedText type="label">{label}</ThemedText>
                <Svg
                  width={theme.fontSizes.font16}
                  height={theme.fontSizes.font16}
                  viewBox="0 0 17 17"
                  fill="none"
                  style={styles.labelHintIcon}
                >
                  <Rect
                    x="0.75"
                    y="0.75"
                    width="15.5"
                    height="15.5"
                    rx="7.75"
                    stroke="#6A1DFF"
                    strokeWidth="1.5"
                  />
                  <Path
                    d="M7.44727 11.0717V10.9773C7.45389 10.3608 7.51521 9.87026 7.63121 9.50568C7.75053 9.1411 7.91957 8.84612 8.13832 8.62074C8.35707 8.39536 8.62056 8.18987 8.9288 8.00426C9.12766 7.87831 9.30664 7.73745 9.46573 7.58168C9.62482 7.4259 9.75077 7.24692 9.84357 7.04474C9.93638 6.84257 9.98278 6.61884 9.98278 6.37358C9.98278 6.0786 9.91317 5.82339 9.77397 5.60795C9.63477 5.39252 9.44916 5.2268 9.21715 5.1108C8.98846 4.99148 8.73325 4.93182 8.45153 4.93182C8.19632 4.93182 7.95271 4.98485 7.7207 5.09091C7.4887 5.19697 7.29646 5.36269 7.144 5.58807C6.99154 5.81013 6.90371 6.09683 6.8805 6.44815H5.36914C5.39234 5.85156 5.54315 5.34777 5.82156 4.93679C6.09996 4.52249 6.46786 4.20928 6.92525 3.99716C7.38595 3.78504 7.89471 3.67898 8.45153 3.67898C9.06138 3.67898 9.59499 3.79332 10.0524 4.02202C10.5098 4.2474 10.8644 4.56392 11.1163 4.97159C11.3715 5.37595 11.4991 5.84825 11.4991 6.38849C11.4991 6.75971 11.4411 7.09446 11.3251 7.39276C11.2091 7.68774 11.0434 7.95123 10.8279 8.18324C10.6158 8.41525 10.3606 8.62074 10.0623 8.79972C9.7806 8.97538 9.55191 9.15767 9.37624 9.34659C9.20389 9.53551 9.07795 9.75923 8.9984 10.0178C8.91886 10.2763 8.87577 10.5961 8.86914 10.9773V11.0717H7.44727ZM8.19798 14.0945C7.9262 14.0945 7.69253 13.9983 7.49698 13.8061C7.30143 13.6106 7.20366 13.3752 7.20366 13.1001C7.20366 12.8284 7.30143 12.5964 7.49698 12.4041C7.69253 12.2086 7.9262 12.1108 8.19798 12.1108C8.46644 12.1108 8.69845 12.2086 8.894 12.4041C9.09286 12.5964 9.19229 12.8284 9.19229 13.1001C9.19229 13.2824 9.14589 13.4498 9.05309 13.6023C8.9636 13.7514 8.84428 13.8707 8.69514 13.9602C8.54599 14.0497 8.38027 14.0945 8.19798 14.0945Z"
                    fill="#6A1DFF"
                  />
                </Svg>
              </TouchableOpacity>
            ) : (
              <ThemedText type="label"> {label}</ThemedText>
            )}
            <View style={styles.selectedWrapper}>
              <ThemedChip
                key={value}
                label={options.find((o) => o.value === value)?.label || ""}
                icon="clear"
                onPress={() => {
                  onChange("");
                }}
                selected
              />
            </View>
          </>
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
    </View>
  );
}
