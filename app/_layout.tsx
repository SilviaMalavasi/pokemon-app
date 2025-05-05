import { SearchResultProvider } from "@/components/context/SearchResultContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect, useState, useCallback } from "react";
import ThemedView from "@/components/base/ThemedView";
import { theme } from "@/style/ui/Theme";
import SplashScreenComponent from "@/components/ui/SplashScreen";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { migrateDbIfNeeded } from "@/lib/sqlite";

import "react-native-reanimated";

// Prevent the native splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Inter-Black": require("../assets/fonts/Inter_28pt-Black.ttf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter_28pt-ExtraBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_28pt-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_28pt-SemiBold.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_28pt-Medium.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter_28pt-Regular.ttf"),
    "Inter-Light": require("../assets/fonts/Inter_28pt-Light.ttf"),
  });

  const [isUpdatingDb, setIsUpdatingDb] = useState(false);

  // Define the init function with the state setter, memoized with useCallback
  const initializeDatabase = useCallback(
    async (db: SQLiteDatabase) => {
      console.log("Running initializeDatabase...");
      await migrateDbIfNeeded(db, setIsUpdatingDb);
    },
    [setIsUpdatingDb]
  ); // Dependency array includes the setter

  useEffect(() => {
    // Hide the native splash screen *only* once fonts are loaded.
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Use the Suspense boundary for DB loading.
  if (!fontsLoaded) {
    // Pass the updating state even to the initial splash screen
    return <SplashScreenComponent isUpdatingDb={isUpdatingDb} />;
  }

  return (
    // Pass the updating state to the fallback splash screen
    <Suspense fallback={<SplashScreenComponent isUpdatingDb={isUpdatingDb} />}>
      <SQLiteProvider
        databaseName="pokemon.db"
        onInit={initializeDatabase} // Use the function that includes the setter
        useSuspense={true}
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
