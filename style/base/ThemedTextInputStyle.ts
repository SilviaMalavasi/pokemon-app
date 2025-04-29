import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.padding.small,
    marginBottom: theme.padding.small,
    width: "100%",
    backgroundColor: "transparent",
  },
  input: {
    borderRadius: theme.borderRadius.small,
    paddingLeft: theme.padding.small,
    paddingRight: theme.padding.small,
    paddingTop: theme.padding.small * 1.25,
    paddingBottom: theme.padding.small,
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.25,
    fontFamily: "Inter-Regular",
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
  labelHint: {
    paddingTop: theme.padding.small,
  },
});

export default styles;
