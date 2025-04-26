import { Text, type TextProps } from "react-native";
import { theme } from "@/style/ui/Theme";
import styles from "@/style/base/ThemedTextStyle";

export type ThemedTextProps = TextProps & {
  type?:
    | "title"
    | "subtitle"
    | "default"
    | "defaultSemiBold"
    | "link"
    | "button"
    | "buttonAlternative"
    | "buttonDisabled"
    | "hintIcon"
    | "hintText";
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
    type === "hintIcon" ? styles.hintIcon : undefined,
    type === "hintText" ? styles.hintText : undefined,
    style,
    color ? { color } : undefined,
    isButtonType && !color ? { color: theme.colors.background } : undefined,
  ];

  return (
    <Text
      style={textStyle}
      {...rest}
    />
  );
}
