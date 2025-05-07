import React from "react";
import { TouchableOpacity, View } from "react-native";
import styles from "@/style/ui/FloatingButtonStyle";
import { Svg, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/style/ui/Theme";

interface FloatingButtonProps {
  title: string;
  onPress: () => void;
  bottom?: number;
}

export default function FloatingButton({ title, onPress, bottom }: FloatingButtonProps) {
  const IconBack = () => (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 27 33"
      fill="none"
    >
      <Path
        d="M12.6549 32V26.3297C17.1466 26.3297 20.7666 22.4234 20.4614 17.7476C20.183 13.483 16.5419 10.2658 12.378 10.2658H10.3753V12.0378C10.3753 13.5025 8.73877 14.3288 7.60963 13.4359L1.67023 8.74048C0.76994 8.02969 0.777606 6.63167 1.68739 5.93261L7.6268 1.35664C8.75975 0.48334 10.3753 1.31356 10.3753 2.76644V4.59524H12.2654C19.4446 4.59524 25.6301 10.246 25.9831 17.6065C26.3646 25.4758 20.2383 32 12.6549 32Z"
        fill="#111218"
        stroke="white"
        stroke-width="2"
      />
    </Svg>
  );

  const gradientColors: [string, string] = [theme.colors.lightPurple, theme.colors.purple];

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: bottom !== undefined ? bottom : theme.padding.small }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.button}>
        <LinearGradient
          colors={gradientColors}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: styles.fab.borderRadius,
            zIndex: 0,
          }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={styles.iconContainerStyle}>
          <IconBack />
        </View>
      </View>
    </TouchableOpacity>
  );
}
