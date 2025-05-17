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
    position: "relative",
    zIndex: 2,
    borderRadius: theme.borderRadius.medium,
    padding: theme.padding.medium,
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.25,
    color: theme.colors.green,
  },
  fakeInnerShadow: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.lightGrey,
    boxShadow: [
      {
        offsetX: 6,
        offsetY: 8,
        blurRadius: "30px",
        color: theme.colors.darkGrey,
        inset: true,
      },
    ],
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
    width: theme.fontSizes.font18,
    zIndex: 2,
  },
  labelHint: {
    paddingTop: theme.padding.medium,
  },
});

export default styles;
