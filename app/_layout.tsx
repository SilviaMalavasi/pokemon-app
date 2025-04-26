import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Inter-Black": require("../assets/fonts/Inter_28pt-Black.ttf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter_28pt-ExtraBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_28pt-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_28pt-SemiBold.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_28pt-Medium.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter_28pt-Regular.ttf"),
    "Inter-Light": require("../assets/fonts/Inter_28pt-Light.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
