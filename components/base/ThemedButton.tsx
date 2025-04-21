import { ButtonProps, TouchableOpacity } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { Colors } from "@/style/Colors";
import styles from "@/style/base/ThemedButtonStyle";
import { LinearGradient } from "expo-linear-gradient";

export type ThemedButtonProps = ButtonProps & {
  type?: "default" | "alternative" | "disabled";
  style?: any;
  gradient?: string[]; // Add gradient prop for background
};

export default function ThemedButton({
  style,
  type = "default",
  disabled = false,
  title,
  gradient,
  ...rest
}: ThemedButtonProps & { title: string }) {
  const buttonType = disabled ? "disabled" : type;
  const buttonStyle = [styles.container, styles[buttonType], style, { paddingVertical: 0, paddingHorizontal: 0 }];

  return (
    <ThemedView style={buttonStyle}>
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        style={{ opacity: disabled ? 0.5 : 1, width: "100%" }}
        {...rest}
      >
        <ThemedText
          style={{ textAlign: "center", paddingVertical: 12, paddingHorizontal: 24 }}
          type={type === "disabled" ? "buttonDisabled" : type === "alternative" ? "buttonAlternative" : "button"}
        >
          {title}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
