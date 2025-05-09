import React, { useState, forwardRef } from "react";
import { TouchableOpacity } from "react-native";
import { TextInput as RNTextInput } from "react-native";
import { Svg, Rect, Path } from "react-native-svg";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedTextInputStyle";

export interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  labelHint?: string;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  maxChars?: number;
}

export default forwardRef<RNTextInput, TextInputProps>(function ThemedTextInput(
  { label, value, onChange, placeholder, labelHint, style, onFocus, onBlur, maxChars },
  ref
) {
  const [showHint, setShowHint] = useState(false);

  // Truncate value for display if maxChars is set
  let displayValue = value;
  if (typeof maxChars === "number" && value.length > maxChars) {
    displayValue = value.slice(0, maxChars) + "...";
  }

  return (
    <ThemedView style={[styles.container, style]}>
      {label && (
        <ThemedLabelWithHint
          label={label}
          labelHint={labelHint}
          showHint={showHint}
          setShowHint={setShowHint}
        />
      )}
      <ThemedView>
        <RNTextInput
          ref={ref}
          style={[styles.input, { flex: 1 }]}
          value={displayValue}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {value.length > 0 && (
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
});
