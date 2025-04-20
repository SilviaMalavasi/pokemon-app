import { Text, type TextProps } from "react-native";
import { Colors } from "@/style/Colors";
import styles from "@/style/base/ThemedTextStyle";

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
};

export default function ThemedText({ style, type = "default", color, ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
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
      ]}
      {...rest}
    />
  );
}
