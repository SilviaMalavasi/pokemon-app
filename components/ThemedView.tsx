import { View, type ViewProps } from "react-native";
import { Colors } from "@/style/Colors";

export function ThemedView({ style, ...otherProps }: ViewProps) {
  const backgroundColor = Colors.background;

  return (
    <View
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}
