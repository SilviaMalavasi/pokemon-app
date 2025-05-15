import { useEffect } from "react";
import { useSearchFormContext } from "@/components/context/SearchFormContext";
import { SearchFormProvider } from "@/components/context/SearchFormContext";
import { UserDatabaseProvider } from "@/components/context/UserDatabaseContext";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/ui/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { usePathname } from "expo-router";
import ThemedText from "@/components/base/ThemedText";
import { Svg, Path } from "react-native-svg";

import { theme } from "@/style/ui/Theme";
import styles from "@/style/ui/TabBarStyles";

// Inline SVG icon components
const HomeIcon = ({ color }: { color: string }) => (
  <Svg
    width={styles.icon.width}
    height={styles.icon.height}
    viewBox="0 0 481.65 473.69"
  >
    <Path
      d="M196.93,370.49c5.65,1.75,11.48,3.22,17.48,4.37l.09,.02c4.29,.88,8.65,1.46,13.06,1.78v-39.46c-10.31-.03-20.56-.78-30.62-2.24v35.53Z"
      fill={color}
    />
    <Path
      d="M152.77,348.05c8.14,6.26,17.24,11.63,27.09,16.03v-32.25c-9.19-2.02-18.24-4.53-27.09-7.53v23.75Z"
      fill={color}
    />
    <Path
      d="M135.7,332.04v-14.21c-4.81-2.02-9.55-4.18-14.21-6.49,3.9,7.43,8.67,14.35,14.21,20.7Z"
      fill={color}
    />
    <Path
      d="M244.62,376.53c9.97-.84,20.05-2.99,30.03-6.41v-35.06c-10.04,1.41-20.07,2.13-30.03,2.16v39.31Z"
      fill={color}
    />
    <Path
      d="M291.72,363c8.62-4.27,17.06-9.5,25.16-15.64,.59-.44,1.17-.9,1.74-1.35v-21.46c-8.92,3.02-17.9,5.52-26.9,7.47v30.98Z"
      fill={color}
    />
    <Path
      d="M335.69,330.45c5.44-5.89,10.19-12.15,14.15-18.79-4.68,2.29-9.4,4.43-14.15,6.42v12.37Z"
      fill={color}
    />
    <Path
      d="M304.93,243.4h.08c9.99,0,20.67-2.64,29.31-7.23,8.74-4.65,15.31-11.08,19-18.58,3.81-7.75,4.66-16.51,2.6-26.78-.65-3.21-1.59-6.55-2.83-9.99-.49,.72-.99,1.45-1.51,2.18-11.42,16.26-30.49,38.07-60.46,58.63,4.2,1.16,8.86,1.76,13.81,1.77Z"
      fill={color}
    />
    <Path
      d="M165.78,243.4h-.08c-9.99,0-20.67-2.64-29.31-7.23-8.74-4.65-15.31-11.08-19-18.58-3.81-7.75-4.66-16.51-2.6-26.78,.65-3.21,1.59-6.55,2.83-9.99,.49,.72,.99,1.45,1.51,2.18,11.42,16.26,30.49,38.07,60.46,58.63-4.2,1.16-8.86,1.76-13.81,1.77Z"
      fill={color}
    />
    <Path
      d="M235.41,49.95c-104.01,0-188.33,84.32-188.33,188.33s84.32,188.33,188.33,188.33,188.33-84.32,188.33-188.33S339.42,49.95,235.41,49.95ZM77.55,183.52c3.93-19.58,14.22-40.24,30.58-61.4,1.43-1.86,3.3-3.36,5.43-4.34,1.91-.88,3.93-1.32,6.03-1.32,4.43,0,8.56,1.99,11.31,5.46,1.35,1.7,2.31,3.7,2.78,5.81,.45,1.62,4.44,15.19,17.28,33.47,12.2,17.37,35.07,42.43,74.87,63.6h19.16c39.8-21.18,62.67-46.23,74.87-63.6,12.83-18.28,16.83-31.85,17.28-33.47,.48-2.11,1.43-4.11,2.78-5.81,2.76-3.47,6.88-5.46,11.31-5.46,2.09,0,4.12,.44,6.03,1.32,2.13,.98,4.01,2.48,5.43,4.34,16.36,21.16,26.65,41.82,30.58,61.4,3.74,18.61,1.79,35.86-5.79,51.27-7.27,14.79-19.52,27.08-35.42,35.54-14.22,7.57-31.04,11.73-47.35,11.73h-.14c-29.47-.05-53.82-13.05-65.78-34.94h-6.77c-11.96,21.89-36.31,34.89-65.78,34.94h-.14c-16.32,0-33.13-4.17-47.35-11.73-15.9-8.46-28.15-20.75-35.42-35.54-7.57-15.41-9.52-32.66-5.79-51.27Zm305.13,109.28c-1,.75-2.06,1.49-3.16,2.22-.6,2.67-1.28,5.31-2.05,7.9-8.33,28.37-27.76,54.32-54.71,73.06-26.92,18.69-58.08,28.97-87.74,28.97-8.89,0-17.66-.91-26.07-2.71-30.32-6.06-58.85-21.23-80.34-42.72-18.83-18.82-31.18-41.12-36.28-65.26-2.43-1.66-4.82-3.35-7.18-5.1l-.54-.44c-5.05-4.45-5.66-11.72-1.42-16.92,4.18-5.12,11.31-6,16.71-2.11,81.67,54.28,191.32,54.12,272.9-.41l.16-.11c2.79-1.77,6.23-2.33,9.44-1.55,3.21,.78,6,2.86,7.66,5.7l.3,.56c2.11,4.37,2.5,11.2-7.67,18.91Z"
      fill={color}
    />
  </Svg>
);

const DeckBuilderIcon = ({ color }: { color: string }) => (
  <Svg
    width={styles.icon.width}
    height={styles.icon.height}
    viewBox="0 0 481.65 473.69"
  >
    <Path
      d="M348.82,51.62H130.25c-13.87,0-25.22,11.35-25.22,25.22v8.41h193.35c23.2,0,42.03,18.83,42.03,42.03V421.5h8.41c13.87,0,25.22-11.35,25.22-25.22V76.84c0-13.87-11.35-25.22-25.22-25.22Z"
      fill={color}
    />
    <Path
      d="M399.26,1.18H180.69c-13.87,0-25.22,11.35-25.22,25.22v8.41h193.35c23.2,0,42.03,18.83,42.03,42.03V371.06h8.41c13.87,0,25.22-11.35,25.22-25.22V26.4c0-13.87-11.35-25.22-25.22-25.22Z"
      fill={color}
    />
    <Path
      d="M299.97,101.96H78.22c-13.05,0-23.63,10.58-23.63,23.63V448.22c0,13.05,10.58,23.63,23.63,23.63h221.75c13.05,0,23.63-10.58,23.63-23.63V125.59c0-13.05-10.58-23.63-23.63-23.63Zm-101.36,291.04c-58.58,5.26-110.33-37.97-115.58-96.55h65.77c4.45,18.66,21.11,31.83,40.3,31.86,19.18-.03,35.85-13.2,40.3-31.86h65.77c-4.6,51.3-45.25,91.95-96.55,96.55Zm-31.84-106.09c.02-12.32,10-22.3,22.32-22.32,12.33,0,22.32,9.99,22.32,22.32s-9.99,22.32-22.32,22.32-22.32-9.99-22.32-22.32Zm62.62-9.54c-4.46-18.65-21.12-31.82-40.3-31.86-19.18,.04-35.83,13.21-40.3,31.86H83.03c4.6-51.3,45.25-91.95,96.55-96.55,58.58-5.26,110.33,37.97,115.58,96.55h-65.77Z"
      fill={color}
    />
  </Svg>
);

const WatchlistIcon = ({ color }: { color: string }) => (
  <Svg
    width={styles.icon.width}
    height={styles.icon.height}
    viewBox="0 0 481.65 474.12"
  >
    <Path
      d="M346.36,50.4H127.98c-13.86,0-25.2,11.34-25.2,25.2v8.4h193.19c23.18,0,42,18.81,42,42V419.97h8.4c13.86,0,25.2-11.34,25.2-25.2V75.6c0-13.86-11.34-25.2-25.2-25.2Z"
      fill={color}
    />
    <Path
      d="M396.76,0H178.37c-13.86,0-25.2,11.34-25.2,25.2v8.4h193.19c23.18,0,42,18.81,42,42V369.58h8.4c13.86,0,25.2-11.34,25.2-25.2V25.2c0-13.86-11.34-25.2-25.2-25.2Z"
      fill={color}
    />
    <Path
      d="M186.77,247.56c-21.95,0-39.74,17.79-39.74,39.74s17.79,39.74,39.74,39.74,39.74-17.79,39.74-39.74-17.79-39.74-39.74-39.74Zm0,59.61c-10.98,0-19.87-8.89-19.87-19.87s8.89-19.87,19.87-19.87,19.87,8.89,19.87,19.87-8.89,19.87-19.87,19.87Z"
      fill={color}
    />
    <Path
      d="M297.56,102.51H75.99c-13.04,0-23.61,10.57-23.61,23.61V448.48c0,13.04,10.57,23.61,23.61,23.61h221.56c13.04,0,23.61-10.57,23.61-23.61V126.12c0-13.04-10.57-23.61-23.61-23.61Zm-67.87,85.93l23.85-23.85c6.78-6.78,17.78-6.78,24.56,0s6.78,17.77,0,24.56l-23.85,23.85c-3.39,3.39-7.83,5.09-12.28,5.09s-8.89-1.7-12.28-5.09c-6.78-6.78-6.78-17.77,0-24.56Zm-60.28-35.28c0-9.59,7.77-17.36,17.36-17.36s17.36,7.77,17.36,17.36v33.73c0,9.59-7.77,17.36-17.36,17.36s-17.36-7.77-17.36-17.36v-33.73Zm-73.95,11.43c6.78-6.78,17.78-6.78,24.56,0l23.85,23.85c6.78,6.78,6.78,17.77,0,24.56-3.39,3.39-7.83,5.09-12.28,5.09s-8.89-1.7-12.28-5.09l-23.85-23.85c-6.78-6.78-6.78-17.77,0-24.56Zm48.41,218.48l-23.85,23.85c-6.78,6.78-17.78,6.78-24.56,0s-6.78-17.77,0-24.56l23.85-23.85c3.39-3.39,7.83-5.09,12.28-5.09s8.89,1.7,12.28,5.09c6.78,6.78,6.78,17.77,0,24.56Zm60.28,35.28c0,9.59-7.77,17.36-17.36,17.36s-17.36-7.77-17.36-17.36v-33.73c0-9.59,7.77-17.36,17.36-17.36s17.36,7.77,17.36,17.36v33.73Zm73.95-11.43c-6.78,6.78-17.78,6.78-24.56,0l-23.85-23.85c-6.78-6.78-6.78-17.77,0-24.56,3.39-3.39,7.83-5.09,12.28-5.09s8.89,1.7,12.28,5.09l23.85,23.85c6.78,6.78,6.78,17.77,0,24.56Zm-91.32-53.39c-58.53,0-105.98-66.24-105.98-66.24,0,0,47.45-66.24,105.98-66.24s105.98,66.24,105.98,66.24c0,0-47.45,66.24-105.98,66.24Z"
      fill={color}
    />
  </Svg>
);

const AdvSearchIcon = ({ color }: { color: string }) => (
  <Svg
    width={styles.icon.width}
    height={styles.icon.height}
    viewBox="0 0 481.65 473.69"
  >
    <Path
      d="M438.87,378.35l-67.81-67.13c38.95-68.97,34.08-175.83-24.51-234.27C275.77,6.16,161.41,6.54,91.01,76.94c-70.78,70.78-70.95,184.96-.18,255.71,58.62,58.44,154.32,64,223.29,25.05,31.78,33.78,53.7,56.89,63.89,67.07,23.94,23.94,46.81,34.02,70.75,10.07,13.87-14.32,14.22-32.56-9.9-56.5Zm-209.41-45.62c-69.74,6.26-131.36-45.21-137.61-114.96h78.31c5.3,22.22,25.14,37.9,47.98,37.94,22.84-.03,42.68-15.72,47.98-37.94h78.31c-5.48,61.07-53.88,109.48-114.96,114.96Zm-40.86-126.32c.03-16.3,13.23-29.5,29.53-29.53,16.31,0,29.53,13.22,29.53,29.53s-13.22,29.53-29.53,29.53-29.53-13.22-29.53-29.53Zm77.51-11.36c-5.32-22.21-25.14-37.88-47.98-37.94-22.83,.05-42.66,15.73-47.98,37.94H91.85c5.48-61.07,53.88-109.48,114.96-114.96,69.74-6.26,131.36,45.21,137.61,114.96h-78.31Z"
      fill={color}
    />
  </Svg>
);

const FreeSearchIcon = ({ color }: { color: string }) => (
  <Svg
    width={styles.icon.width}
    height={styles.icon.height}
    viewBox="0 0 481.65 473.69"
  >
    <Path
      d="M431.63,378.92l-67.81-67.13c38.95-68.97,34.08-175.83-24.51-234.27C268.53,6.74,154.17,7.11,83.77,77.51c-70.78,70.78-70.95,184.96-.18,255.71,58.62,58.44,154.32,64,223.29,25.05,31.78,33.78,53.7,56.89,63.89,67.07,23.94,23.94,46.81,34.02,70.75,10.07,13.87-14.32,14.22-32.56-9.9-56.5Zm-219.79-50.02c-69.74,0-126.28-56.54-126.28-126.28s56.54-126.28,126.28-126.28,126.28,56.54,126.28,126.28-56.54,126.28-126.28,126.28Z"
      fill={color}
    />
    <Path
      d="M133.97,166.04v-28.45h113.02v28.45h-39.11v101.59h-34.8v-101.59h-39.11Z"
      fill={color}
    />
    <Path
      d="M214.36,198.45v-18.96h75.35v18.96h-26.08v67.73h-23.2v-67.73h-26.08Z"
      fill={color}
    />
  </Svg>
);

function SearchFormContextWatcher() {
  const pathname = usePathname();
  const { setLastSearchPage } = useSearchFormContext();
  useEffect(() => {
    if (pathname === "searchresult") {
      setLastSearchPage(null);
    }
  }, [pathname, setLastSearchPage]);
  return null;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <UserDatabaseProvider>
      <SearchFormProvider>
        <SearchFormContextWatcher />
        <Tabs
          screenOptions={{
            tabBarInactiveTintColor: theme.colors.grey,
            tabBarActiveTintColor: theme.colors.green,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
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
            }),
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
              tabBarIcon: ({ color }) => <HomeIcon color={color} />,
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
              tabBarIcon: ({ color }) => <DeckBuilderIcon color={color} />,
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
              tabBarIcon: ({ color }) => <WatchlistIcon color={color} />,
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
              tabBarIcon: ({ color }) => <AdvSearchIcon color={color} />,
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
              tabBarIcon: ({ color }) => <FreeSearchIcon color={color} />,
            }}
          />
          <Tabs.Screen
            name="cards"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="decks"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="watchlists"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </SearchFormProvider>
    </UserDatabaseProvider>
  );
}
