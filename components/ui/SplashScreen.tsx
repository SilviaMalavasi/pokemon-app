import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/ui/SplashScreenStyle";

const messages = [
  "Catching Pokémon in the database",
  "Browsing full-art cards instead of working",
  "Polishing Poké Balls to a mirror shine",
  "Syncing with Professor Oak’s Wi-Fi",
  "Negotiating with Mewtwo for loading speed",
  "Wishing this was a shiny load",
];

export default function SplashScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
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
          <ThemedText style={styles.title}>Updating Database</ThemedText>
          <View style={styles.animatedTextContainer}>
            <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>{messages[messageIndex]}</Animated.Text>
          </View>
        </View>
      </ThemedView>
    </View>
  );
}
