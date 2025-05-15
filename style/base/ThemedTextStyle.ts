import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  h1: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.font36,
    lineHeight: theme.fontSizes.font36 * 1.14,
  },
  h2: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.font28,
    lineHeight: theme.fontSizes.font28 * 1.14,
  },
  h3: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.font24,
    lineHeight: theme.fontSizes.font24 * 1.14,
  },
  h4: {
    fontFamily: "Inter-Bold",
    fontSize: theme.fontSizes.font18,
    lineHeight: theme.fontSizes.font18 * 1.14,
  },
  default: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.33,
  },
  link: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.15,
  },
  button: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.font18,
    lineHeight: theme.fontSizes.font18 * 1.15,
    textTransform: "uppercase",
    color: theme.colors.white,
  },
  buttonSmall: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.font16,
    lineHeight: theme.fontSizes.font16 * 1.15,
    textTransform: "uppercase",
  },
  buttonDisabled: {
    fontFamily: "Inter-Bold",
    fontSize: theme.fontSizes.font18,
    lineHeight: theme.fontSizes.font18 * 1.15,
    textTransform: "uppercase",
  },
  chip: {
    fontFamily: "Inter-Bold",
    fontSize: theme.fontSizes.font16,
    lineHeight: theme.fontSizes.font16 * 2,
    textTransform: "uppercase",
  },
  hintIcon: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.15,
    color: theme.colors.purple,
    borderWidth: 1,
    borderColor: theme.colors.purple,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 0,
  },
  hintText: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.font16,
    lineHeight: theme.fontSizes.font16 * 1.15,
    color: theme.colors.purple,
  },
  label: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.font16,
    lineHeight: theme.fontSizes.font16 * 1.15,
    color: theme.colors.grey,
  },
});

export default styles;
