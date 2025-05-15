import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/style/ui/Theme";

export default function TabBarBackground() {
  return (
    <LinearGradient
      colors={[theme.colors.lightGrey, theme.colors.darkGrey]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
