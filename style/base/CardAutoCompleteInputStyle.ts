import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    backgroundColor: "transparent",
  },
  suggestionsListContainer: {
    width: "100%",
    marginVertical: theme.padding.small,
    backgroundColor: theme.colors.mediumGrey,
    borderRadius: theme.borderRadius.medium,
    boxShadow: [
      {
        color: theme.colors.darkGrey,
        offsetX: 4,
        offsetY: 4,
        blurRadius: "12px",
      },
      {
        offsetX: 6,
        offsetY: 8,
        blurRadius: "30px",
        color: theme.colors.darkGrey,
        inset: true,
      },
    ],
  },
  suggestionLabel: {
    padding: theme.padding.small,
    paddingBottom: theme.padding.xsmall / 2,
    color: theme.colors.purple,
  },
  customItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
    color: theme.colors.grey,
  },
});

export default styles;
