import React from "react";
import { View } from "react-native";

export default function TabBarBackground() {
  return <View style={{ backgroundColor: "transparent" }} />;
}

export function useBottomTabOverflow() {
  return 0;
}
