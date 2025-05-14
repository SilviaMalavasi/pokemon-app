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
    marginBottom: theme.padding.xsmall,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.grey,
  },
  suggestionLabel: {
    padding: theme.padding.small,
    paddingBottom: theme.padding.xsmall / 2,
    color: theme.colors.greyAlternative,
  },
  customItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.mediumGrey,
    color: theme.colors.grey,
  },
});

export default styles;
