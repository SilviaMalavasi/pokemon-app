import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

export default StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.xlarge,
    backgroundColor: theme.colors.mediumGrey,
    paddingHorizontal: theme.padding.small,
    paddingVertical: theme.padding.xsmall,
    marginBottom: theme.padding.xsmall,
    boxShadow: [
      {
        color: theme.colors.shadowLight,
        offsetX: -1,
        offsetY: -1,
        blurRadius: "12px",
      },
      {
        color: theme.colors.darkGrey,
        offsetX: 4,
        offsetY: 4,
        blurRadius: "12px",
      },
    ],
  },
  chipSelected: {
    backgroundColor: theme.colors.mediumGrey,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  icon: {
    width: theme.padding.medium,
    height: theme.padding.medium,
    marginRight: theme.padding.small,
    alignSelf: "center",
  },
});
