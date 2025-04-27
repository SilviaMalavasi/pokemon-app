import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/ui/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { theme } from "@/style/ui/Theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: theme.colors.text,
        tabBarActiveTintColor: theme.colors.textHilight,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          default: {
            backgroundColor: theme.colors.black,
            borderTopWidth: 0,
            height: 62,
            paddingHorizontal: 8,
            paddingTop: 4,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="advancedsearch"
        options={{
          title: "Advanced Search",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="magnifyingglass"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="freesearch"
        options={{
          title: "Free Search",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="textformat"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
