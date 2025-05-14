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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.grey,
  },
  checkboxInner: {
    width: theme.padding.medium - 2,
    height: theme.padding.medium - 2,
    backgroundColor: theme.colors.purple,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: theme.colors.darkGrey,
  },
  label: {
    color: theme.colors.grey,
    fontSize: theme.fontSizes.font18,
    paddingHorizontal: theme.padding.small,
  },
});

export default styles;
