import { Text, type TextProps, TextStyle } from "react-native";
import { vw } from "@/helpers/viewport";
import styles from "@/style/base/ThemedTextStyle";

export type ThemedTextProps = TextProps & {
  type?:
    | "title"
    | "subtitle"
    | "default"
    | "defaultSemiBold"
    | "link"
    | "button"
    | "buttonSmall"
    | "buttonAlternative"
    | "buttonDisabled"
    | "hintIcon"
    | "hintText"
    | "label";
  color?: string;
  fontSize?: number;
  fontWeight?: "black" | "bold" | "extra-bold" | "light" | "medium" | "regular" | "semi-bold";
  gradient?: string[];
};

export default function ThemedText({ style, type = "default", color, fontSize, fontWeight, ...rest }: ThemedTextProps) {
  // Map custom fontWeight values to valid React Native values
  const fontWeightMap: Record<string, TextStyle["fontWeight"]> = {
    black: "900",
    bold: "bold",
    "extra-bold": "800",
    "semi-bold": "600",
    light: "300",
    medium: "500",
    regular: "400",
  };
  const mappedFontWeight = fontWeight ? fontWeightMap[fontWeight] : undefined;

  // Determine the style based on type
  const textStyle = [
    type === "default" ? styles.default : undefined,
    type === "title" ? styles.title : undefined,
    type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
    type === "subtitle" ? styles.subtitle : undefined,
    type === "link" ? styles.link : undefined,
    type === "button" ? styles.button : undefined,
    type === "buttonSmall" ? styles.buttonSmall : undefined,
    type === "buttonAlternative" ? styles.buttonAlternative : undefined,
    type === "buttonDisabled" ? styles.buttonDisabled : undefined,
    type === "hintIcon" ? styles.hintIcon : undefined,
    type === "hintText" ? styles.hintText : undefined,
    type === "label" ? styles.label : undefined,
    style,
    fontSize ? { fontSize: vw(fontSize) } : undefined,
    mappedFontWeight ? { fontWeight: mappedFontWeight } : undefined,
    color ? { color } : undefined,
  ];

  return (
    <Text
      style={textStyle}
      {...rest}
    />
  );
}
