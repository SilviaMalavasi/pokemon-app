import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

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
    width: theme.padding.medium * 1.5 + 6,
    height: theme.padding.medium * 1.5 + 6,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.lightGrey,
    boxShadow: [
      {
        offsetX: 6,
        offsetY: 6,
        blurRadius: "8px",
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
    top: 5,
    left: 5,
    zIndex: 2,
    width: theme.padding.medium * 1.5 - 2,
    height: theme.padding.medium * 1.5 - 2,
    backgroundColor: theme.colors.green,
    borderRadius: theme.borderRadius.small,
  },

  label: {
    fontSize: theme.fontSizes.font14,
    color: theme.colors.grey,
    paddingTop: vw(1),
    paddingLeft: theme.padding.medium * 1.5,
    paddingRight: theme.padding.small,
  },
});

export default styles;
