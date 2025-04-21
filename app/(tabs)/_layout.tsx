import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/ui/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/style/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors.text,
        tabBarActiveTintColor: Colors.highlight,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          default: {
            backgroundColor: Colors.lightBackground,
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
        name="fullform"
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
    </Tabs>
  );
}
