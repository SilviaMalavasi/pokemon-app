import React from "react";
import { TouchableOpacity, View } from "react-native";
import styles from "@/style/ui/FloatingButtonStyle";
import { Svg, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/style/ui/Theme";

interface FloatingButtonProps {
  title: string;
  onPress: () => void;
}

export default function FloatingButton({ title, onPress }: FloatingButtonProps) {
  const IconBack = () => (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 27 34"
      fill="none"
    >
      <Path
        d="M12.5872 34V27.781C17.4383 27.781 21.3479 23.4966 21.0184 18.3683C20.7176 13.691 16.7852 10.1625 12.2882 10.1625H10.1253V12.106C10.1253 13.7124 8.35788 14.6186 7.1384 13.6394L0.723844 8.48956C-0.248465 7.70999 -0.240186 6.17667 0.742383 5.40996L7.15694 0.391153C8.38053 -0.566659 10.1253 0.343906 10.1253 1.93738V3.94317H12.1667C19.9201 3.94317 26.6005 10.1407 26.9817 18.2136C27.3937 26.8444 20.7774 34 12.5872 34Z"
        fill="#111218"
      />
    </Svg>
  );

  const gradientColors: [string, string] = [theme.colors.lightPurple, theme.colors.purple];

  return (
    <TouchableOpacity
      style={styles.fab}
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
