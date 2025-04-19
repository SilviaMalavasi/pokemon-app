import { View, type ViewProps } from "react-native";
import styles from "@/style/base/ThemedViewStyle";

export default function ThemedView({ style, ...otherProps }: ViewProps) {
  return (
    <View
      style={[styles.container, style]}
      {...otherProps}
    />
  );
}
