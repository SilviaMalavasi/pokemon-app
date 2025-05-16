import React, { useState } from "react";
import { View, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/ui/ThemedViewStyle";

type ThemedViewProps = {
  children: ReactNode;
  layout?: "big" | "box" | "rounded";
  style?: ViewStyle | ViewStyle[];
};

export default function ThemedView({ children, layout = "big", style }: ThemedViewProps) {
  const [containerHeight, setContainerHeight] = useState(0);

  if (layout === "big") {
    // Set your desired pixel stop
    const pixelStop = 400;
    // Calculate the relative stop (avoid division by zero)
    const stop = containerHeight > 0 ? pixelStop / containerHeight : 0.5;

    return (
      <LinearGradient
        colors={[theme.colors.lightGrey, theme.colors.darkGrey]}
        locations={[0, stop]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.4, y: 0.7 }}
        style={[styles.containerBig, style]}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.containerBigInner}>{children}</View>
      </LinearGradient>
    );
  } else if (layout === "rounded") {
    return <View style={[styles.containerRounded, style]}>{children}</View>;
  } else {
    const pixelStop = 400;
    const stop = containerHeight > 0 ? pixelStop / containerHeight : 0.5;
    return (
      <LinearGradient
        colors={[theme.colors.lightGrey, theme.colors.mediumGrey]}
        locations={[0, stop]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.4, y: 0.7 }}
        style={[styles.containerBox, style]}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        <View>{children}</View>
      </LinearGradient>
    );
  }
}
