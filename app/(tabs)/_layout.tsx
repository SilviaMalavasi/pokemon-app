import { useEffect } from "react";
import { useSearchFormContext } from "@/components/context/SearchFormContext";
import { SearchFormProvider } from "@/components/context/SearchFormContext";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/ui/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { usePathname } from "expo-router";
import { Svg, Path } from "react-native-svg";

import { theme } from "@/style/ui/Theme";
import styles from "@/style/ui/TabBarStyles";

// Inline SVG icon components
const HomeIcon = ({ color }: { color: string }) => (
  <Svg
    width={styles.icon.width}
    height={styles.icon.height}
    viewBox="0 0 520.81 520.81"
    fill="none"
  >
    <Path
      d="M505.58,286.66c-16.04,151.13-150.59,234.15-243.95,234.15-99.31,0-227.7-83.04-243.95-234.15,0,0,10.1,8.71,22.35,17.18,66.67,45.27,143.59,72.93,221.54,73.16h.12c77.96-.23,154.88-27.89,221.54-73.16"
      fill={color}
    />
    <Path
      d="M52.76,0C-117.99,250.95,175.34,354.25,233.42,218.86,80.31,127.4,52.55-.2,52.76,0Z"
      fill={color}
    />
    <Path
      d="M468.05,0c170.75,250.95-122.58,354.25-180.66,218.86C440.5,127.41,468.26-.2,468.05,0Z"
      fill={color}
    />
    <Path
      d="M189.32,369.11v138.39c21.58,7.76,43.32,12.18,64,13.12v-143.74c-21.5-.6-42.9-3.25-64-7.77Z"
      fill={color}
    />
    <Path
      d="M40.02,303.84c-12.25-8.47-22.35-17.18-22.35-17.18,7.45,69.3,38.5,124.26,79.5,163.49v-113.16c-19.7-9.58-38.81-20.69-57.15-33.15Z"
      fill={color}
    />
    <Path
      d="M114.25,344.84v120.3c18.24,14.68,37.9,26.54,58,35.48v-135.6c-19.7-5.19-39.09-11.97-58-20.18Z"
      fill={color}
    />
    <Path
      d="M350.45,365.16v134.55c19.8-9.06,39.4-20.97,57.68-35.64v-118.85c-18.82,8.12-38.09,14.82-57.68,19.95Z"
      fill={color}
    />
    <Path
      d="M270.39,376.85v143.72c19.91-1.06,41.38-5.7,62.99-13.77v-137.58c-20.77,4.41-41.83,7.02-62.99,7.64Z"
      fill={color}
    />
    <Path
      d="M483.23,303.84c-18.61,12.64-38.02,23.9-58.02,33.58v111.74c41.28-39.15,73.08-93.78,80.37-162.5l-22.35,17.18Z"
      fill={color}
    />
    <Path
      d="M261.69,377.01h-.12c-2.75,0-5.5-.06-8.25-.14v143.74c2.79,.13,5.56,.2,8.31,.2,2.88,0,5.81-.08,8.76-.24v-143.72c-2.9,.08-5.8,.14-8.7,.15Z"
      fill="#000"
    />
    <Path
      d="M333.38,369.22v137.58c5.69-2.12,11.39-4.49,17.07-7.08v-134.55c-5.67,1.48-11.36,2.84-17.07,4.06Z"
      fill="#000"
    />
    <Path
      d="M408.13,345.22v118.85c5.84-4.69,11.54-9.66,17.07-14.91v-111.74c-5.64,2.73-11.34,5.32-17.07,7.8Z"
      fill="#000"
    />
    <Path
      d="M172.25,365.02v135.6c5.67,2.52,11.36,4.82,17.07,6.87v-138.39c-5.72-1.22-11.41-2.6-17.07-4.09Z"
      fill="#000"
    />
    <Path
      d="M97.17,336.99v113.16c5.52,5.28,11.22,10.28,17.07,14.99v-120.3c-5.74-2.49-11.43-5.11-17.07-7.85Z"
      fill="#000"
    />
  </Svg>
);

const FreeSearchIcon = ({ color }: { color: string }) => (
  <Svg
    width={styles.icon.width}
    height={styles.icon.height}
    viewBox="0 0 474.06 473.43"
    fill="none"
  >
    <Path
      d="M375.56,299.28c43.28-76.64,32.55-175.52-32.55-240.45-78.64-78.64-205.7-78.22-283.93,0s-78.83,205.51-.2,284.12c65.13,64.94,163.81,75.64,240.45,32.36,35.31,37.54,59.67,63.21,70.98,74.53,26.6,26.6,59.67,33.27,86.27,6.67,26.78-26.78,21.12-56.03-5.68-82.63"
      fill={color}
    />
    <Path
      d="M202.5,41.09c86.09,0,155.91,69.82,155.91,155.91s-69.82,155.91-155.91,155.91S46.59,283.09,46.59,197c0-86.09,69.82-155.91,155.91-155.91Z"
      fill="#000"
    />
    <Path
      d="M106.36,151.85v-35.12H245.9v35.12h-48.29v125.42h-42.96v-125.42h-48.29Z"
      fill={color}
    />
    <Path
      d="M205.61,191.86v-23.41h93.02v23.41h-32.19v83.62h-28.64v-83.62h-32.19Z"
      fill={color}
    />
  </Svg>
);

const AdvSearchIcon = ({ color }: { color: string }) => (
  <Svg
    width={styles.icon.width}
    height={styles.icon.height}
    viewBox="0 0 474.06 473.43"
    fill="none"
  >
    <Path
      d="M375.56,299.28c43.28-76.64,32.55-175.52-32.55-240.45-78.64-78.64-205.7-78.22-283.93,0-78.64,78.64-78.83,205.51-.2,284.12,65.13,64.94,163.81,75.64,240.45,32.36,35.31,37.54,59.67,63.21,70.98,74.53,26.6,26.6,59.67,33.27,86.27,6.67,26.78-26.78,21.12-56.03-5.68-82.63"
      fill={color}
    />
    <Path
      d="M200.33,141.82c28.19,.06,52.67,19.42,59.23,46.83h96.67c-7.72-86.1-83.79-149.64-169.89-141.92C110.94,53.5,51.18,113.26,44.42,188.66h96.67c6.56-27.41,31.04-46.77,59.23-46.83Z"
      fill="#000"
    />
    <Path
      d="M200.33,263.54c-28.2-.04-52.69-19.41-59.23-46.83H44.42c7.72,86.1,83.79,149.64,169.89,141.92,75.4-6.76,135.16-66.52,141.92-141.92h-96.67c-6.54,27.43-31.03,46.79-59.23,46.83Z"
      fill="#000"
    />
    <Path
      d="M167.52,202.68c0,18.12,14.69,32.81,32.81,32.81s32.81-14.69,32.81-32.81-14.69-32.81-32.81-32.81c-18.11,.03-32.77,14.7-32.81,32.81Z"
      fill="#000"
    />
  </Svg>
);

function SearchFormContextWatcher() {
  const pathname = usePathname();
  const { setLastSearchPage } = useSearchFormContext();
  useEffect(() => {
    if (pathname === "/advancedsearch" || pathname === "/freesearch" || pathname.startsWith("/cards/")) {
      // do nothing
    } else {
      setLastSearchPage(null);
    }
  }, [pathname, setLastSearchPage]);
  return null;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <SearchFormProvider>
      <SearchFormContextWatcher />
      <Tabs
        screenOptions={{
          tabBarInactiveTintColor: theme.colors.text,
          tabBarActiveTintColor: theme.colors.textHilight,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            android: {
              backgroundColor: theme.colors.black,
              borderTopWidth: 0,
              height: styles.tabBarContainer.height + insets.bottom,
              paddingHorizontal: theme.padding.small,
              paddingTop: theme.padding.xsmall,
              paddingBottom: insets.bottom,
            },
            default: {
              backgroundColor: theme.colors.black,
              borderTopWidth: 0,
              height: styles.tabBarContainer.height + insets.bottom,
              paddingHorizontal: theme.padding.small,
              paddingTop: theme.padding.xsmall,
            },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>Home</Text>,
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="advancedsearch"
          options={{
            tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>Advanced Search</Text>,
            tabBarIcon: ({ color }) => <AdvSearchIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="freesearch"
          options={{
            tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>Free Search</Text>,
            tabBarIcon: ({ color }) => <FreeSearchIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="cards"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </SearchFormProvider>
  );
}
