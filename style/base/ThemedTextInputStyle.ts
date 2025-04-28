import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.padding.small,
    marginBottom: theme.padding.medium,
  },
  label: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: theme.padding.xsmall,
    padding: theme.padding.xsmall,
    backgroundColor: theme.colors.background,
  },
  labelHintIcon: {
    height: theme.fontSizes.small,
    width: theme.fontSizes.small,
    marginLeft: theme.padding.xsmall,
  },
  labelHint: {
    paddingTop: theme.padding.small,
    paddingLeft: theme.padding.small,
    paddingRight: theme.padding.xsmall,
  },
  input: {
    borderRadius: 4,
    paddingLeft: theme.padding.small,
    paddingRight: theme.padding.small,
    paddingTop: theme.padding.small * 1.25,
    paddingBottom: theme.padding.small,
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.25,
    fontFamily: "Inter-Regular",
    backgroundColor: theme.colors.background,
    color: theme.colors.textHilight,
    borderWidth: 1,
    borderColor: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.grey,
  },
  clearIcon: {
    position: "absolute",
    right: theme.padding.small,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    height: "100%",
    width: theme.fontSizes.medium,
    zIndex: 1,
  },
});

export default styles;
