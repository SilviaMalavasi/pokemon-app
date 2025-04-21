import { Text, type TextProps } from "react-native";
import { Colors } from "@/style/Colors";
import styles from "@/style/base/ThemedTextStyle";
import { LinearGradient } from "expo-linear-gradient";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "button"
    | "buttonAlternative"
    | "buttonDisabled";
  color?: string;
  gradient?: string[];
};

export default function ThemedText({ style, type = "default", color, gradient, ...rest }: ThemedTextProps) {
  // Determine the style based on type
  const isButtonType = type === "button" || type === "buttonAlternative";
  const textStyle = [
    type === "default" ? styles.default : undefined,
    type === "title" ? styles.title : undefined,
    type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
    type === "subtitle" ? styles.subtitle : undefined,
    type === "link" ? styles.link : undefined,
    type === "button" ? styles.button : undefined,
    type === "buttonAlternative" ? styles.buttonAlternative : undefined,
    type === "buttonDisabled" ? styles.buttonDisabled : undefined,
    style,
    color ? { color } : undefined,
    isButtonType && !color ? { color: Colors.darkBackground } : undefined,
  ];

  if (type === "button" || type === "buttonAlternative") {
    // Define default gradients for each button type
    const buttonGradient = [Colors.green, Colors.lightGreen, Colors.green];
    const buttonAlternativeGradient = [Colors.purple, Colors.lightPurple, Colors.purple];

    const selectedGradient: [string, string, ...string[]] =
      (gradient ?? []).length >= 2
        ? (gradient as [string, string, ...string[]])
        : ((type === "button" ? buttonGradient : buttonAlternativeGradient) as [string, string, ...string[]]);

    return (
      <LinearGradient
        colors={selectedGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ justifyContent: "center", alignItems: "center", borderRadius: 4, overflow: "hidden" }}
      >
        <Text
          style={textStyle}
          {...rest}
        />
      </LinearGradient>
    );
  }

  return (
    <Text
      style={textStyle}
      {...rest}
    />
  );
}
