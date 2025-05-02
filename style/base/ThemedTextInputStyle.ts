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
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.small * 0.9,
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.25,
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
    top: 2,
    bottom: 0,
    justifyContent: "center",
    height: "100%",
    width: theme.fontSizes.large,
    padding: 4,
    zIndex: 2,
  },
  labelHint: {
    paddingTop: theme.padding.small,
  },
});

export default styles;
