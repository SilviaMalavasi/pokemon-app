import { ButtonProps, TouchableOpacity } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { Colors } from "@/style/Colors";
import styles from "@/style/base/ThemedButtonStyle";

export type ThemedButtonProps = ButtonProps & {
  type?: "default" | "alternative" | "disabled";
  style?: any;
};

export default function ThemedButton({
  style,
  type = "default",
  color,
  disabled = false,
  title,
  ...rest
}: ThemedButtonProps & { title: string }) {
  const themedColor = color || Colors.text;
  const buttonType = disabled ? "disabled" : type;
  const buttonStyle = [styles.container, styles[buttonType], style];

  return (
    <ThemedView style={buttonStyle}>
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        style={{ opacity: disabled ? 0.5 : 1 }}
        {...rest}
      >
        <ThemedText
          style={{ color: themedColor, textAlign: "center" }}
          type="defaultSemiBold"
        >
          {title}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
