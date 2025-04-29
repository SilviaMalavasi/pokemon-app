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
    borderColor: theme.colors.text,
  },
  chipSelected: {
    backgroundColor: theme.colors.lightGrey,
    borderColor: theme.colors.text,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: theme.colors.textHilight,
  },
  icon: {
    width: theme.padding.small,
    height: theme.padding.small,
    marginRight: theme.padding.xsmall,
    alignSelf: "center",
  },
});
