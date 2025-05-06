import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/ui/SplashScreenStyle";

const messages = [
  "Catching Pokémon\nin the database",
  "Negotiating with Mewtwo\nfor loading speed",
  "Polishing Poké Balls\nto a mirror shine",
  "Syncing with\nProfessor Oak’s Wi-Fi",
  "Wishing this was a shiny load",
];

// Define props for the component
interface SplashScreenProps {
  isUpdatingDb: boolean;
}

export default function SplashScreen({ isUpdatingDb }: SplashScreenProps) {
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
    }, 3500); // Change message every 3.5 seconds (includes fade times)

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={{ flex: 1 }}>
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
              <View style={styles.animatedTextContainer}>
                <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>{messages[messageIndex]}</Animated.Text>
              </View>{" "}
            </>
          )}
        </View>
      </ThemedView>
    </View>
  );
}
