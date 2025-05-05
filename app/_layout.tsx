import { SearchResultProvider } from "@/components/context/SearchResultContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect } from "react";
import ThemedView from "@/components/base/ThemedView";
import { theme } from "@/style/ui/Theme";
import SplashScreenComponent from "@/components/ui/SplashScreen";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "@/lib/sqlite";

import "react-native-reanimated";

// Prevent the native splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Renamed for clarity
    "Inter-Black": require("../assets/fonts/Inter_28pt-Black.ttf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter_28pt-ExtraBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_28pt-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_28pt-SemiBold.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_28pt-Medium.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter_28pt-Regular.ttf"),
    "Inter-Light": require("../assets/fonts/Inter_28pt-Light.ttf"),
  });

  useEffect(() => {
    // Hide the native splash screen *only* once fonts are loaded.
    // Suspense will handle showing the fallback during DB loading.
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // If fonts are not loaded yet, show the custom splash screen.
  // This covers the time between the native splash hiding (triggered by fontsLoaded)
  // and the Suspense boundary taking over for DB loading.
  if (!fontsLoaded) {
    return <SplashScreenComponent />;
  }

  // Fonts are loaded, now render the main app structure.
  // Use Suspense to show the splash screen while the DB initializes.
  return (
    // Wrap SQLiteProvider and the rest of the app in Suspense
    <Suspense fallback={<SplashScreenComponent />}>
      <SQLiteProvider
        databaseName="pokemon.db"
        onInit={migrateDbIfNeeded}
        // Enable Suspense integration
        useSuspense={true} // Use boolean true
      >
        <SearchResultProvider>
          <ThemedView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: theme.colors.background },
                animation: "fade",
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemedView>
        </SearchResultProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
