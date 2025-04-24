import { ButtonProps, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import styles from "@/style/base/ThemedButtonStyle";
import { Colors } from "@/style/base/Colors";

export type ThemedButtonProps = ButtonProps & {
  type?: "default" | "alternative" | "disabled";
  size?: "small" | "large";
  style?: any;
  gradient?: string[]; // Add gradient prop for background
};

const buttonGradient = [Colors.green, Colors.lightGreen, Colors.green];
const buttonAlternativeGradient = [Colors.purple, Colors.lightPurple, Colors.purple];

export default function ThemedButton({
  style,
  type = "default",
  size = "large",
  disabled = false,
  title,
  gradient,
  ...rest
}: ThemedButtonProps & { title: string }) {
  const buttonType = disabled ? "disabled" : type;
  const isSmall = size === "small";
  const buttonStyle = [
    styles.container,
    isSmall ? styles.containerSmall : styles.containerLarge,
    styles[buttonType],
    style,
  ];

  const selectedGradient: [string, string, ...string[]] =
    (gradient ?? []).length >= 2
      ? (gradient as [string, string, ...string[]])
      : ((type === "alternative" ? buttonAlternativeGradient : buttonGradient) as [string, string, ...string[]]);

  return (
    <ThemedView style={buttonStyle}>
      <LinearGradient
        colors={selectedGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: 8 }]}
      />
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        style={{
          opacity: disabled ? 0.5 : 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
        {...rest}
      >
        <ThemedText
          style={{ textAlign: "center" }}
          type={type === "disabled" ? "buttonDisabled" : type === "alternative" ? "buttonAlternative" : "button"}
        >
          {title}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
