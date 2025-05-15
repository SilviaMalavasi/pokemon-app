import React from "react";
import { View } from "react-native";
import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/ui/ThemedViewStyle";

type ThemedViewProps = {
  children: ReactNode;
};

export default function ThemedView({ children }: ThemedViewProps) {
  return (
    <LinearGradient
      colors={[theme.colors.lightGrey, theme.colors.darkGrey]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.4, y: 0.7 }}
      style={styles.container}
    >
      <View style={styles.containerInner}>{children}</View>
    </LinearGradient>
  );
}
