import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: [{ display: "none" }],
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="deckbuilder" />
      <Tabs.Screen name="watchlist" />
      <Tabs.Screen name="advancedsearch" />
      <Tabs.Screen name="freesearch" />
    </Tabs>
  );
}
