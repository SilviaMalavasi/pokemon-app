import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    backgroundColor: "transparent",
  },
  suggestionsListContainer: {
    position: "absolute",
    bottom: "100%",
    right: 0,
    width: "100%",
    height: 140,
    marginBottom: theme.padding.xsmall,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    zIndex: 1,
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
