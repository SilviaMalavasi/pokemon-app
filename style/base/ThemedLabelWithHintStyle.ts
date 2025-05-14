import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    top: theme.padding.xsmall,
    left: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: theme.padding.xsmall,
    paddingHorizontal: theme.padding.xsmall,
  },
  touchableOpacity: {
    position: "absolute",
    top: theme.fontSizes.font16 / 2,
    left: 0,
    zIndex: 2,
    marginLeft: theme.padding.xsmall,
  },
  touchableOpacityLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.padding.xsmall,
  },
  labelHintIcon: {
    height: theme.fontSizes.font16,
    width: theme.fontSizes.font16,
    marginLeft: theme.padding.xsmall,
  },
  labelHint: {
    paddingTop: theme.padding.small,
    paddingLeft: theme.padding.small,
    paddingRight: theme.padding.xsmall,
  },
});

export default styles;
