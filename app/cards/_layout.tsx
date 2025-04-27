import { Stack } from "expo-router";
import React from "react";
import { Colors } from "@/style/base/Colors";

export default function CardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.black,
        },
        headerTintColor: Colors.highlight,
        headerTitleStyle: {
          color: Colors.text,
        },
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    />
  );
}
