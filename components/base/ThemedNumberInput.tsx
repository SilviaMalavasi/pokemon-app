import React, { useState } from "react";
import { TextInput, TouchableOpacity, Pressable, View } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import { Svg, Rect, Path } from "react-native-svg";
import styles from "@/style/base/ThemedNumberInputStyle";
import { theme } from "@/style/ui/Theme";
import ThemedModal from "@/components/base/ThemedModal";
import ThemedButton from "@/components/base/ThemedButton";

interface ThemedNumberInputProps {
  label?: string;
  value: number | "";
  onChange: (value: number | "", operator: string) => void;
  placeholder?: string;
  labelHint?: string;
  showOperatorSelect?: "none" | "basic" | "advanced";
  operator?: string;
  onOperatorChange?: (operator: string) => void;
  resetKey?: number; // Add resetKey prop
}

export default function ThemedNumberInput({
  label,
  value,
  onChange,
  placeholder,
  labelHint,
  showOperatorSelect = "none",
  operator = "=",
  onOperatorChange,
  resetKey,
}: ThemedNumberInputProps) {
  const [showHint, setShowHint] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Reset modal and hint when resetKey changes
  React.useEffect(() => {
    setShowHint(false);
    setModalVisible(false);
  }, [resetKey]);

  const handleOperatorSelect = (op: { label: string; value: string }) => {
    if (onOperatorChange) onOperatorChange(op.value);
    onChange(value, op.value);
    setModalVisible(false);
  };

  // Define operator rows once for use in both picker and modal
  const operatorRows = [
    [
      { label: "=", value: "=" },
      { label: "≥", value: ">=" },
      { label: "≤", value: "<=" },
    ],
    ...(showOperatorSelect === "advanced"
      ? [
          [
            { label: "+", value: "+" },
            { label: "×", value: "×" },
          ],
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      {labelHint && value === "" && (
        <ThemedLabelWithHint
          labelHint={labelHint}
          showHint={showHint}
          setShowHint={setShowHint}
        />
      )}
      <View style={styles.inputContainer}>
        <View style={styles.fakeInnerShadow} />

        {/* Modal-based single operator select */}
        {showOperatorSelect !== "none" && (
          <>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={styles.pickerWrapper}
              accessibilityRole="button"
              accessibilityLabel="Select operator"
            >
              <ThemedText
                style={styles.selectPressable}
                color={theme.colors.purple}
              >
                {(() => {
                  const flatOps = operatorRows.flat();
                  return flatOps.find((o) => o.value === operator)?.label || "=";
                })()}
              </ThemedText>
            </Pressable>
            <ThemedModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              buttonText="Cancel"
              buttonType="alternative"
              buttonSize="small"
              onConfirm={() => setModalVisible(false)}
            >
              <View style={styles.numbersModalContainer}>
                {/* Render operator rows */}
                {operatorRows.map((row, rowIdx) => (
                  <View
                    key={rowIdx}
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    {row.map((op) => (
                      <View key={op.value}>
                        <ThemedButton
                          title={op.label}
                          type="outline"
                          size="large"
                          onPress={() => handleOperatorSelect(op)}
                          style={[styles.numbersModal, { paddingBottom: theme.padding.xsmall }]}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ThemedModal>
          </>
        )}
        <TextInput
          style={[
            styles.input,
            showOperatorSelect !== "none"
              ? { borderLeftWidth: 0, borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }
              : undefined,
          ]}
          value={value === "" ? "" : String(value)}
          onChangeText={(text) => {
            if (text === "") {
              onChange("", operator);
            } else {
              const cleaned = text.replace(/[^0-9]/g, "");
              const num = Number(cleaned);
              if (!isNaN(num) && num >= 0) {
                onChange(num, operator);
              } else if (cleaned === "") {
                onChange("", operator);
              }
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.grey}
          keyboardType="numeric"
          inputMode="numeric"
          returnKeyType="done"
        />
        {value !== "" && (
          <TouchableOpacity
            onPress={() => onChange("", operator)}
            accessibilityLabel={`Clear ${label || "input"}`}
            style={styles.clearIcon}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 17 18"
              fill="none"
            >
              <Rect
                x={0.75}
                y={1.25}
                width={15.5}
                height={15.5}
                rx={7.75}
                stroke={theme.colors.green}
                strokeWidth={1.5}
              />
              <Path
                d="M5 5.5L12 12.5"
                stroke={theme.colors.green}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <Path
                d="M12 5.5L5 12.5"
                stroke={theme.colors.green}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </View>
      {showHint && labelHint && <ThemedText type="hintText">{labelHint}</ThemedText>}
    </View>
  );
}
