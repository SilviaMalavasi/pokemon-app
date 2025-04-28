import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.padding.medium,
  },
  label: {
    paddingBottom: theme.padding.xsmall,
    paddingLeft: theme.padding.small,
  },
  input: {
    borderRadius: 4,
    padding: theme.padding.small,
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
    zIndex: 1,
  },
});

export default styles;
