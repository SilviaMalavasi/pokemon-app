import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter-Black",
    fontSize: theme.fontSizes.xlarge,
    lineHeight: theme.fontSizes.xlarge * 1.15,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.large,
    lineHeight: theme.fontSizes.large * 1.15,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  default: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.15,
    color: theme.colors.text,
  },
  defaultSemiBold: {
    fontFamily: "Inter-SemiBold",
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.15,
    color: theme.colors.text,
  },
  link: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.15,
    color: theme.colors.textHilight,
  },
  button: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.15,
    textTransform: "uppercase",
    color: theme.colors.background,
  },
  buttonSmall: {
    fontFamily: "Inter-ExtraBold",
    fontSize: theme.fontSizes.small,
    lineHeight: theme.fontSizes.small * 1.15,
    textTransform: "uppercase",
    color: theme.colors.background,
  },
  buttonDisabled: {
    fontFamily: "Inter-Bold",
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.15,
    textTransform: "uppercase",
    color: theme.colors.background,
  },
  chip: {
    fontFamily: "Inter-Bold",
    fontSize: theme.fontSizes.small,
    lineHeight: theme.fontSizes.small * 2,
    textTransform: "uppercase",
    color: theme.colors.text,
  },
  hintIcon: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.xsmall,
    lineHeight: theme.fontSizes.xsmall * 1.15,
    color: theme.colors.textAlternative,
    borderWidth: 1,
    borderColor: theme.colors.textAlternative,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 0,
  },
  hintText: {
    fontFamily: "Inter-Regular",
    fontSize: theme.fontSizes.small,
    lineHeight: theme.fontSizes.small * 1.15,
    color: theme.colors.textAlternative,
  },
  label: {
    fontFamily: "Inter-Medium",
    fontSize: theme.fontSizes.small,
    lineHeight: theme.fontSizes.small * 1.15,
    color: theme.colors.text,
  },
});

export default styles;
