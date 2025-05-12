import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/ui/SplashScreenStyle";
import { theme } from "@/style/ui/Theme";

const messages = [
  "Catching Pokémon\nin the database",
  "Negotiating with Mewtwo\nfor loading speed",
  "Polishing Poké Balls\nto a mirror shine",
  "Syncing with\nProfessor Oak's Wi-Fi",
  "Telling Slowpoke to hurry up",
  "Sending a Pidgey\nwith the last data packet",
  "Checking the Pokédex\nfor missing assets",
  "Team Rocket stole\nmy loading speed!",
  "Trying to evolve\ninto a loaded screen",
  "Teaching Psyduck\nto debug the app",
  "Wishing this was a shiny load",
];

// Define props for the component
interface SplashScreenProps {
  isUpdatingDb: boolean;
  progress?: number; // 0 to 1, optional for backward compatibility
}

export default function SplashScreen({ isUpdatingDb, progress = 0 }: SplashScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity: 1

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out
        duration: 500, // Duration for fade out
        useNativeDriver: true,
      }).start(() => {
        // Change message after fading out
        setMessageIndex((prev) => (prev + 1) % messages.length);
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1, // Fade in
          duration: 500, // Duration for fade in
          useNativeDriver: true,
        }).start();
      });
    }, 4500); // Change message every 3.5 seconds (includes fade times)

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={{ flex: 1, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
      <View
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        pointerEvents="none"
      >
        <Image
          source={require("@/assets/images/splash-background.webp")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
      <ThemedView style={styles.overlay}>
        <View style={styles.centerContent}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.icon}
          />
          {isUpdatingDb && (
            <>
              <ThemedText
                type="buttonSmall"
                color="white"
                style={styles.title}
              >
                Updating Database
              </ThemedText>
              {/* Warning if update is interrupted */}
              <ThemedText
                type="hintText"
                style={styles.warnigText}
              >
                This may take few minutes the first time you open the app. Do not close or background the app until the
                update is complete. If interrupted, the update will resume next time you open the app.
              </ThemedText>
              {/* Loading bar */}
              {typeof progress === "number" && (
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${Math.max(0, Math.round(progress * 100))}%` }]} />
                </View>
              )}
              <View style={styles.animatedTextContainer}>
                <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>{messages[messageIndex]}</Animated.Text>
              </View>
            </>
          )}
        </View>
      </ThemedView>
    </View>
  );
}
