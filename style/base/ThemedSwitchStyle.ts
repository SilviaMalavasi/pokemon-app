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
    paddingLeft: theme.padding.xsmall,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "transparent",
  },
  hintContainer: {
    width: "100%",
    marginTop: theme.padding.xsmall,
  },
  labelHintTouchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  labelHintIcon: {
    width: theme.fontSizes.font16,
    height: theme.fontSizes.font16,
    marginLeft: theme.padding.xsmall,
  },
  hintText: {
    marginTop: theme.padding.small,
    flex: 1,
  },
});

export default ThemedSwitchStyle;
