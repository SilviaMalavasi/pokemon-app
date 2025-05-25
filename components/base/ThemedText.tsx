import { Text, type TextProps, TextStyle } from "react-native";
import { vw } from "@/helpers/viewport";
import styles from "@/style/base/ThemedTextStyle";

export type ThemedTextProps = TextProps & {
  type?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "default"
    | "link"
    | "button"
    | "buttonOutline"
    | "buttonOutlineSmall"
    | "buttonAlternative"
    | "buttonAlternativeSmall"
    | "chip"
    | "hintIcon"
    | "hintText"
    | "label"
    | "tabLabel";
  color?: string;
  fontSize?: number;
  fontWeight?: "black" | "bold" | "extra-bold" | "light" | "medium" | "regular" | "semi-bold";
  gradient?: string[];
};

export default function ThemedText({
  style,
  type = "default",
  color,
  fontSize,
  fontWeight,
  accessibilityRole,
  accessibilityLabel,
  ...rest
}: ThemedTextProps) {
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
    type === "h1" ? styles.h1 : undefined,
    type === "h2" ? styles.h2 : undefined,
    type === "h3" ? styles.h3 : undefined,
    type === "h4" ? styles.h4 : undefined,
    type === "link" ? styles.link : undefined,
    type === "button" ? styles.button : undefined,
    type === "buttonOutline" ? styles.buttonOutline : undefined,
    type === "buttonOutlineSmall" ? styles.buttonOutlineSmall : undefined,
    type === "buttonAlternative" ? styles.buttonAlternative : undefined,
    type === "buttonAlternativeSmall" ? styles.buttonAlternativeSmall : undefined,
    type === "chip" ? styles.chip : undefined,
    type === "hintIcon" ? styles.hintIcon : undefined,
    type === "hintText" ? styles.hintText : undefined,
    type === "label" ? styles.label : undefined,
    type === "tabLabel" ? styles.tabLabel : undefined,
    style,
    fontSize ? { fontSize: vw(fontSize) } : undefined,
    mappedFontWeight ? { fontWeight: mappedFontWeight } : undefined,
    color ? { color } : undefined,
  ];

  // Set accessibilityRole to 'header' for headings unless overridden
  const computedAccessibilityRole =
    accessibilityRole || (["h1", "h2", "h3", "h4"].includes(type) ? "header" : undefined);

  return (
    <Text
      style={textStyle}
      accessibilityRole={computedAccessibilityRole}
      accessibilityLabel={accessibilityLabel}
      {...rest}
    />
  );
}
