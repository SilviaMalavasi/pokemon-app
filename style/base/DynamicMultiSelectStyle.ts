import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: theme.padding.small,
    width: "100%",
    backgroundColor: "transparent",
  },
  container: {
    marginBottom: theme.padding.small,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.text,
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
  picker: {
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.padding.xsmall,
    width: "100%",
    fontSize: theme.fontSizes.medium,
    fontFamily: "Inter-Regular",
    borderWidth: 0,
    paddingLeft: theme.padding.small,
    paddingRight: theme.padding.small,
    paddingTop: theme.padding.small * 1.25,
    paddingBottom: theme.padding.small,
  },
  selectedAndHintWrapper: {
    backgroundColor: "transparent",
    alignItems: "flex-start",
  },
  selectedWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: theme.padding.xsmall,
    backgroundColor: "transparent",
    paddingBottom: theme.padding.small,
  },
  labelHint: {
    paddingTop: theme.padding.xsmall,
  },
});

export default styles;
