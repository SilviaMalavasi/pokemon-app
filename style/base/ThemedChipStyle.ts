import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

export default StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.xlarge,
    backgroundColor: theme.colors.lightGrey,
    paddingHorizontal: theme.padding.small,
    paddingVertical: theme.padding.xsmall * 0.5,
    borderWidth: 1,
    borderColor: theme.colors.grey,
  },
  chipSelected: {
    backgroundColor: theme.colors.lightGrey,
    borderColor: theme.colors.grey,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: theme.colors.grey,
  },
  chipTextSelected: {
    color: theme.colors.green,
  },
  icon: {
    width: theme.padding.small,
    height: theme.padding.small,
    marginRight: theme.padding.xsmall,
    alignSelf: "center",
  },
});
