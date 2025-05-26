import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/ui/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import ThemedText from "@/components/base/ThemedText";

import { theme } from "@/style/ui/Theme";
import styles from "@/style/ui/TabBarStyles";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: theme.colors.grey,
        tabBarActiveTintColor: theme.colors.green,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: [
          { display: "none" },
          /*           Platform.select({
            android: {
              backgroundColor: theme.colors.black,
              borderTopWidth: 0,
              height: styles.tabBarContainer.height + insets.bottom,
              paddingHorizontal: theme.padding.xsmall,
              paddingTop: 6,
              paddingBottom: insets.bottom,
            },
            default: {
              backgroundColor: theme.colors.black,
              borderTopWidth: 0,
              height: styles.tabBarContainer.height + insets.bottom,
              paddingHorizontal: theme.padding.xsmall,
              paddingTop: 6,
            },
          }), */
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText
              type="tabLabel"
              style={[styles.label, { color }]}
            >
              Home
            </ThemedText>
          ),
          tabBarAccessibilityLabel: "Home Tab",
        }}
      />
      <Tabs.Screen
        name="deckbuilder"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText
              type="tabLabel"
              style={[styles.label, { color }]}
            >
              Deck Builder
            </ThemedText>
          ),
          tabBarAccessibilityLabel: "Deck Builder Tab",
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText
              type="tabLabel"
              style={[styles.label, { color }]}
            >
              Watchlist
            </ThemedText>
          ),
          tabBarAccessibilityLabel: "Watchlist Tab",
        }}
      />
      <Tabs.Screen
        name="advancedsearch"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText
              type="tabLabel"
              style={[styles.label, { color }]}
            >
              Advanced Search
            </ThemedText>
          ),
          tabBarAccessibilityLabel: "Advanced Search Tab",
        }}
      />
      <Tabs.Screen
        name="freesearch"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText
              type="tabLabel"
              style={[styles.label, { color }]}
            >
              Free Search
            </ThemedText>
          ),
          tabBarAccessibilityLabel: "Free Search Tab",
        }}
      />
    </Tabs>
  );
}
