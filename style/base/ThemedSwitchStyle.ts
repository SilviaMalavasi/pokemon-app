import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const ThemedSwitchStyle = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: theme.padding.small,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    gap: theme.padding.xsmall,
  },
  label: {
    paddingLeft: theme.padding.small,
  },
  labelHintTouchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  labelHintIcon: {
    width: theme.fontSizes.small,
    height: theme.fontSizes.small,
    marginLeft: theme.padding.xsmall,
  },
  hintText: {
    flex: "100%",
  },
});

export default ThemedSwitchStyle;
