import React from "react";
import { View, type ViewProps } from "react-native";
import styles from "@/style/base/ThemedViewStyle";

const ThemedView = React.forwardRef<View, ViewProps>(({ style, ...otherProps }, ref) => {
  return (
    <View
      ref={ref}
      style={[styles.container, style]}
      {...otherProps}
    />
  );
});

export default ThemedView;
