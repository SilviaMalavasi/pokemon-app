import React, { useState, forwardRef } from "react";
import { TouchableOpacity } from "react-native";
import { TextInput, View } from "react-native";
import { Svg, Rect, Path } from "react-native-svg";
import ThemedText from "@/components/base/ThemedText";
import ThemedLabelWithHint from "@/components/base/ThemedLabelWithHint";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedTextInputStyle";

export interface ThemedTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  labelHint?: string;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  maxChars?: number;
  multiline?: number | boolean; // Accepts number for lines or boolean for default
  lineNumber?: number; // Deprecated, use multiline as number
}

export default forwardRef<TextInput, ThemedTextInputProps>(function ThemedTextInput(
  { value, onChange, placeholder, labelHint, style, onFocus, onBlur, maxChars, multiline = false, lineNumber },
  ref
) {
  const [showHint, setShowHint] = useState(false);

  // Truncate value for display if maxChars is set
  let displayValue = value;
  if (typeof maxChars === "number" && value.length > maxChars) {
    displayValue = value.slice(0, maxChars) + "...";
  }

  // Determine multiline and numberOfLines
  let isMultiline = false;
  let numberOfLines = undefined;
  let inputHeight = undefined;
  if (typeof multiline === "number") {
    isMultiline = true;
    numberOfLines = multiline;
    if (theme?.fontSizes?.font15) {
      inputHeight = theme.fontSizes.font15 * multiline;
    }
  } else if (multiline === true) {
    isMultiline = true;
    numberOfLines = lineNumber;
    if (theme?.fontSizes?.font15 && lineNumber) {
      inputHeight = theme.fontSizes.font15 * lineNumber;
    }
  }

  return (
    <View style={[styles.container, style]}>
      <View style={{ position: "relative" }}>
        {labelHint && value.length === 0 && (
          <ThemedLabelWithHint
            labelHint={labelHint}
            setShowHint={setShowHint}
            showHint={showHint}
          />
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { flex: 1 },
            isMultiline ? { textAlignVertical: "top" } : null,
            inputHeight ? { height: inputHeight } : null,
          ]}
          value={displayValue}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          onFocus={onFocus}
          onBlur={onBlur}
          multiline={isMultiline}
          numberOfLines={numberOfLines}
        />
        <View style={styles.fakeInnerShadow} />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChange("")}
            accessibilityLabel={`Clear ${placeholder || "input"}`}
            style={[styles.clearIcon, isMultiline ? styles.clearIconMultiline : null]}
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
      {showHint && labelHint && (
        <ThemedText
          type="hintText"
          style={styles.labelHint}
        >
          {labelHint}
        </ThemedText>
      )}
    </View>
  );
});
