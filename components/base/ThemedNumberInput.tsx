import React, { useState } from "react";
import { TouchableOpacity, Modal, Pressable, View } from "react-native";
import { TextInput as RNTextInput } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import { Svg, Rect, Path } from "react-native-svg";
import styles from "@/style/base/ThemedNumberInputStyle";
import { theme } from "@/style/ui/Theme";

interface NumberInputProps {
  label?: string;
  value: number | "";
  onChange: (value: number | "", operator: string) => void;
  placeholder?: string;
  labelHint?: string;
  showOperatorSelect?: "none" | "basic" | "advanced";
}

export default function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  labelHint,
  showOperatorSelect = "none",
}: NumberInputProps): JSX.Element {
  const [showHint, setShowHint] = useState(false);
  const [currentOperator, setCurrentOperator] = useState("=");
  const [modalVisible, setModalVisible] = useState(false);

  const handleOperatorSelect = (op: { label: string; value: string }) => {
    setCurrentOperator(op.value);
    onChange(value, op.value);
    setModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      {label && (
        <ThemedLabelWithHint
          label={label}
          labelHint={labelHint}
          showHint={showHint}
          setShowHint={setShowHint}
        />
      )}
      <ThemedView style={styles.inputContainer}>
        {/* Modal-based single operator select */}
        {showOperatorSelect !== "none" && (
          <>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={styles.pickerWrapper}
            >
              <ThemedText style={styles.selectPressable}>
                {/* Show current operator label */}
                {(() => {
                  const allOps = [
                    { label: "=", value: "=" },
                    { label: "≥", value: ">=" },
                    { label: "≤", value: "<=" },
                    ...(showOperatorSelect === "advanced"
                      ? [
                          { label: "+", value: "+" },
                          { label: "x", value: "x" },
                        ]
                      : []),
                  ];
                  return allOps.find((o) => o.value === currentOperator)?.label || "=";
                })()}
              </ThemedText>
            </Pressable>
            <Modal
              visible={modalVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  {/* First row: =, ≥, ≤ */}
                  <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 8 }}>
                    {[
                      { label: "=", value: "=" },
                      { label: "≥", value: ">=" },
                      { label: "≤", value: "<=" },
                    ].map((op) => (
                      <Pressable
                        key={op.value}
                        onPress={() => handleOperatorSelect(op)}
                        style={[styles.modalOption, { marginHorizontal: 8 }]}
                      >
                        <ThemedText style={currentOperator === op.value ? styles.selectedOperator : styles.operator}>
                          {op.label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                  {/* Second row: +, × (only for advanced) */}
                  {showOperatorSelect === "advanced" && (
                    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 8 }}>
                      {[
                        { label: "+", value: "+" },
                        { label: "×", value: "×" },
                      ].map((op) => (
                        <Pressable
                          key={op.value}
                          onPress={() => handleOperatorSelect(op)}
                          style={[styles.modalOption, { marginHorizontal: 8 }]}
                        >
                          <ThemedText style={currentOperator === op.value ? styles.selectedOperator : styles.operator}>
                            {op.label}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  )}
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    style={styles.modalCancel}
                  >
                    <ThemedText style={{ color: theme.colors.placeholder }}>Cancel</ThemedText>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </>
        )}
        <RNTextInput
          style={[
            styles.input,
            showOperatorSelect !== "none"
              ? { borderLeftWidth: 0, borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }
              : undefined,
          ]}
          value={value === "" ? "" : String(value)}
          onChangeText={(text) => {
            if (text === "") {
              onChange("", currentOperator);
            } else {
              const cleaned = text.replace(/[^0-9]/g, "");
              const num = Number(cleaned);
              if (!isNaN(num) && num >= 0) {
                onChange(num, currentOperator);
              } else if (cleaned === "") {
                onChange("", currentOperator);
              }
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          keyboardType="numeric"
          inputMode="numeric"
          returnKeyType="done"
        />
        {value !== "" && (
          <TouchableOpacity
            onPress={() => onChange("")}
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
                stroke={theme.colors.textHilight}
                strokeWidth={1.5}
              />
              <Path
                d="M5 5.5L12 12.5"
                stroke={theme.colors.textHilight}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <Path
                d="M12 5.5L5 12.5"
                stroke={theme.colors.textHilight}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </ThemedView>
      {showHint && labelHint && (
        <ThemedText
          type="hintText"
          style={styles.labelHint}
        >
          {labelHint}
        </ThemedText>
      )}
    </ThemedView>
  );
}
