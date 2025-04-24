import React from "react";
import { View, type ViewProps } from "react-native";
import styles from "@/style/base/ThemedViewStyle";

// Add type prop to props
interface ThemedViewProps extends ViewProps {
  type?: "default" | "bordered";
}

const ThemedView = React.forwardRef<View, ThemedViewProps>(({ style, type = "default", ...otherProps }, ref) => {
  return (
    <View
      ref={ref}
      style={[styles.container, type === "bordered" && styles.bordered, style]}
      {...otherProps}
    />
  );
});

export default ThemedView;
