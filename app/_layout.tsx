import { SearchResultProvider } from "@/components/context/SearchResultContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect } from "react";
import { View } from "react-native";
import { theme } from "@/style/ui/Theme";
import SplashScreenComponent from "@/components/ui/SplashScreen";
import { CardDatabaseProvider } from "@/components/context/CardDatabaseContext";
import { UserDatabaseProvider } from "@/components/context/UserDatabaseContext";
import { DatabaseStateProvider, useDatabaseState } from "@/components/context/DatabaseStateContext";
import CustomTabBar from "@/components/ui/CustomTabBar";

import "react-native-reanimated";

// Prevent the native splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Wrapper component to connect the splash screen to database state
function DatabasesWithSplash({ children }: { children: React.ReactNode }) {
  const { isAnyDbUpdating, setCardDbUpdating, setUserDbUpdating, cardDbProgress, userDbProgress, setCardDbProgress } =
    useDatabaseState();
  const progress = Math.max(cardDbProgress, userDbProgress);

  return (
    <>
      <UserDatabaseProvider setIsUpdatingDb={setUserDbUpdating}>
        <CardDatabaseProvider
          setIsUpdatingDb={setCardDbUpdating}
          setCardDbProgress={setCardDbProgress}
        >
          {children}
        </CardDatabaseProvider>
      </UserDatabaseProvider>

      {/* Show splash screen when any database is updating */}
      {isAnyDbUpdating && (
        <SplashScreenComponent
          isUpdatingDb={true}
          progress={progress}
        />
      )}
    </>
  );
}

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <SplashScreenComponent isUpdatingDb={false} />;
  }

  return (
    <Suspense fallback={<SplashScreenComponent isUpdatingDb={false} />}>
      <DatabaseStateProvider>
        <DatabasesWithSplash>
          <SearchResultProvider>
            <View style={{ flex: 1, backgroundColor: theme.colors.darkGrey }}>
              <Stack
                screenOptions={{
                  contentStyle: { backgroundColor: theme.colors.darkGrey },
                  animation: "fade",
                  headerShown: false,
                }}
              >
                <Stack.Screen
                  name="(tabs)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
              <CustomTabBar />
              <StatusBar style="auto" />
            </View>
          </SearchResultProvider>
        </DatabasesWithSplash>
      </DatabaseStateProvider>
    </Suspense>
  );
}
