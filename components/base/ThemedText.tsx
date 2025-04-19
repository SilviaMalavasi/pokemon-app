import { Text, type TextProps } from "react-native";
import { Colors } from "@/style/Colors";
import styles from "@/style/base/ThemedTextStyle";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export default function ThemedText({ style, type = "default", ...rest }: ThemedTextProps) {
  const color = Colors.text;

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
