import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  label: {
    position: "absolute",
    top: theme.padding.xsmall,
    left: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: theme.padding.xsmall,
    paddingHorizontal: theme.padding.xsmall,
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
});

export default styles;
