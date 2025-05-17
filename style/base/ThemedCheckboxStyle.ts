import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.padding.small,
  },
  checkbox: {
    width: theme.padding.medium,
    height: theme.padding.medium,
    borderRadius: theme.borderRadius.small,
    justifyContent: "center",
    alignItems: "center",
  },
  fakeInnerShadow: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    left: 0,
    width: theme.padding.medium + 6,
    height: theme.padding.medium + 6,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.lightGrey,
    boxShadow: [
      {
        offsetX: 6,
        offsetY: 8,
        blurRadius: "5px",
        color: theme.colors.darkGrey,
        inset: true,
      },
    ],
  },
  checkboxChecked: {
    position: "relative",
    zIndex: 2,
  },
  checkboxInner: {
    position: "absolute",
    top: -1,
    left: 3,
    zIndex: 2,
    width: theme.padding.medium,
    height: theme.padding.medium,
    backgroundColor: theme.colors.green,
    borderRadius: theme.borderRadius.small,
  },

  label: {
    color: theme.colors.grey,
    paddingLeft: theme.padding.medium,
    paddingRight: theme.padding.small,
  },
});

export default styles;
