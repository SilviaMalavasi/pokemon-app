import React from "react";
import { TouchableOpacity, View, Text, ViewStyle, TextStyle } from "react-native";
import { Svg, Rect, Path } from "react-native-svg";
import styles from "@/style/base/ThemedChipStyle";
import { theme } from "@/style/ui/Theme";
import ThemedText from "@/components/base/ThemedText";

// SVG Icon: Clear
const IconClear = ({ stroke }: { stroke: string }) => (
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
      stroke={stroke}
      strokeWidth={1.5}
    />
    <Path
      d="M5 5.5L12 12.5"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M12 5.5L5 12.5"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const icons: Record<string, (props: { stroke: string; style?: any }) => any> = {
  clear: (props) => <IconClear {...props} />,
};

interface ThemedChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: string | "void";
  chipBackgroundColor?: string;
  chipTextColor?: string;
}

export default function ThemedChip({
  label,
  selected = false,
  onPress,
  style,
  disabled = false,
  icon = "void",
  chipBackgroundColor,
  chipTextColor,
}: ThemedChipProps) {
  const IconComponent = icon !== "void" && icons[icon] ? icons[icon] : null;
  const iconStroke = chipTextColor || theme.colors.green;
  const chipBg = chipBackgroundColor || (selected ? theme.colors.green : theme.colors.mediumGrey);
  const chipText = chipTextColor || theme.colors.green;
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: chipBg },
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected, disabled }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {IconComponent ? <View style={styles.icon}>{IconComponent({ stroke: iconStroke })}</View> : null}
      <ThemedText
        type="chip"
        style={{ color: chipText }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}
