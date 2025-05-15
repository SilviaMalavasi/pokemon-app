import React from "react";
import { View, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/ui/ThemedViewStyle";

type ThemedViewProps = {
  children: ReactNode;
  layout: "big" | "box" | "rounded";
  style?: ViewStyle | ViewStyle[];
};

export default function ThemedView({ children, layout, style }: ThemedViewProps) {
  if (layout === "big") {
    return (
      <LinearGradient
        colors={[theme.colors.lightGrey, theme.colors.darkGrey]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.4, y: 0.7 }}
        style={[styles.containerBig, style]}
      >
        <View style={styles.containerBigInner}>{children}</View>
      </LinearGradient>
    );
  } else if (layout === "rounded") {
    return <View style={[styles.containerRounded, style]}>{children}</View>;
  } else {
    return (
      <LinearGradient
        colors={[theme.colors.lightGrey, theme.colors.mediumGrey]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.4, y: 0.7 }}
        style={[styles.containerBox, style]}
      >
        <View>{children}</View>
      </LinearGradient>
    );
  }
}
