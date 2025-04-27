import React from "react";
import { View, type ViewProps } from "react-native";
import { theme } from "@/style/ui/Theme";

// Add type prop to props
interface ThemedViewProps extends ViewProps {
  padding?: "none" | "xsmall" | "small" | "medium" | "large" | "xlarge";
  backgroundColor?: "background" | "lightBackground";
  borderRadius?: "none" | "small" | "medium" | "large";
}

export default function ThemedView({
  style,
  padding = "none",
  backgroundColor = "background",
  borderRadius = "none",
  ...otherProps
}: ThemedViewProps) {
  const themedStyle = {
    padding: theme.padding[padding],
    backgroundColor: theme.colors[backgroundColor],
    borderRadius: theme.borderRadius[borderRadius],
  };
  return (
    <View
      style={[themedStyle, style]}
      {...otherProps}
    />
  );
}
