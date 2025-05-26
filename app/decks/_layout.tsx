import { Stack } from "expo-router";
import React from "react";
import { theme } from "@/style/ui/Theme";

export default function DecksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: theme.colors.darkGrey },
      }}
    />
  );
}
