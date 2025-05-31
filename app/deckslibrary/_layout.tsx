import { Stack } from "expo-router";
import React from "react";
import { theme } from "@/style/ui/Theme";
import { LimitlessDatabaseProvider } from "@/components/context/LimitlessDatabaseContext";

export default function DecksLibraryLayout() {
  return (
    <LimitlessDatabaseProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: theme.colors.darkGrey },
        }}
      />
    </LimitlessDatabaseProvider>
  );
}
