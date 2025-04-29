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
    maxHeight: 150,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    marginBottom: theme.padding.xsmall,
  },
  suggestionLabel: {
    padding: theme.padding.small,
    paddingBottom: theme.padding.xsmall / 2,
    color: theme.colors.textAlternative,
  },
  customItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.mediumGrey,
    color: theme.colors.text,
  },
});

export default styles;
