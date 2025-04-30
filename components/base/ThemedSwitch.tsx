import React, { useState } from "react";
import { Switch, SwitchProps, TouchableOpacity } from "react-native";
import { Svg, Rect, Path } from "react-native-svg";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";

import styles from "@/style/base/ThemedSwitchStyle";
import { theme } from "@/style/ui/Theme";

interface ThemedSwitchProps extends SwitchProps {
  value: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
  hint?: string;
  disabled?: boolean;
  style?: any; // Allow passing custom styles
}

export default function ThemedSwitch({
  value,
  label,
  onValueChange,
  hint,
  disabled = false,
  style,
  ...rest
}: ThemedSwitchProps) {
  const [showHint, setShowHint] = useState(false);
  return (
    <ThemedView style={[styles.container, style]}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.colors.lightGrey, true: theme.colors.lightGrey }}
        thumbColor={value ? theme.colors.green : theme.colors.purple}
        {...rest}
        style={styles.switch}
      />
      <ThemedView style={styles.labelContainer}>
        <ThemedText
          type="default"
          style={styles.label}
        >
          {label}
        </ThemedText>
        {hint && (
          <TouchableOpacity
            onPress={() => setShowHint((v) => !v)}
            accessibilityLabel={hint}
          >
            <Svg
              width={theme.fontSizes.small}
              height={theme.fontSizes.small}
              viewBox="0 0 17 17"
              fill="none"
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
                d="M12 5.5L5 12.5"
                stroke="#6A1DFF"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <Path
                d="M5 5.5L12 12.5"
                stroke="#6A1DFF"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </ThemedView>
      {showHint && (
        <ThemedText
          style={styles.hintText}
          type="hintText"
        >
          {hint}
        </ThemedText>
      )}
    </ThemedView>
  );
}
