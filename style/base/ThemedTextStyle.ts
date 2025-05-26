import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  h1: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.font36,
    lineHeight: theme.fontSizes.font36 * 1.14,
    color: theme.colors.white,
  },
  h2: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.font28,
    lineHeight: theme.fontSizes.font28 * 1.14,
    color: theme.colors.white,
  },
  h3: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.font24,
    lineHeight: theme.fontSizes.font24 * 1.14,
    color: theme.colors.white,
  },
  h4: {
    fontFamily: "Inter-Bold",
    fontSize: theme.fontSizes.font18,
    lineHeight: theme.fontSizes.font18 * 1.14,
    color: theme.colors.white,
  },
  default: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.33,
    color: theme.colors.grey,
  },
  link: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.15,
    color: theme.colors.green,
  },
  button: {
    fontFamily: "Inter-Bold",
    fontSize: theme.fontSizes.font16,
    lineHeight: theme.fontSizes.font16 * 1.15,
  },
  buttonAlternative: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.font16,
    lineHeight: theme.fontSizes.font16 * 1.15,
  },
  buttonAlternativeSmall: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.font14,
    lineHeight: theme.fontSizes.font14 * 1.15,
  },
  buttonOutline: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.font16,
    lineHeight: theme.fontSizes.font16 * 1.15,
  },
  buttonOutlineSmall: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.15,
  },
  chip: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.font14,
    lineHeight: theme.fontSizes.font14 * 1.15,
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
    fontSize: theme.fontSizes.font14,
    lineHeight: theme.fontSizes.font14 * 1.15,
    color: theme.colors.purple,
    paddingTop: theme.padding.xsmall,
  },
  label: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.font16,
    lineHeight: theme.fontSizes.font16 * 1.15,
    color: theme.colors.grey,
  },
  tabLabel: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.font9,
    lineHeight: theme.fontSizes.font9 * 1.15,
    color: theme.colors.white,
    textAlign: "center",
    paddingTop: 6,
  },
});

export default styles;
