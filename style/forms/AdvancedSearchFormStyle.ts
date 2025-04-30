import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.padding.xsmall,
  },
  halfButton: {
    flexBasis: "48%",
    flexGrow: 1,
    flexShrink: 1,
  },
  summaryContainer: {
    borderWidth: 1,
    borderColor: theme.colors.green,
    borderRadius: theme.borderRadius.small,
    padding: theme.padding.xsmall,
  },
  summaryItemContainer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginBottom: 2 },
});

export default styles;
