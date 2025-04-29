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
    borderRadius: theme.borderRadius.small,
    backgroundColor: "transparent",
  },
  label: {
    position: "absolute",
    top: theme.padding.xsmall * -1,
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
  pickerWrapper: {
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.text,
    width: "100%",
  },
  picker: {
    color: theme.colors.placeholder,
    backgroundColor: "transparent",
  },
  pickerItem: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: theme.fontSizes.medium,
    paddingVertical: theme.padding.xsmall,
    paddingHorizontal: theme.padding.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text,
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
