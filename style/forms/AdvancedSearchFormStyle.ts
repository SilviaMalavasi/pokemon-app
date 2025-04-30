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
    position: "relative",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.colors.green,
    borderRadius: theme.borderRadius.small,
    padding: theme.padding.small,
    paddingTop: theme.padding.medium,
    marginBottom: theme.padding.medium,
  },
  summaryLabel: {
    position: "absolute",
    top: theme.padding.xsmall * -1,
    left: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: theme.padding.xsmall,
    paddingHorizontal: theme.padding.xsmall,
  },
  summaryItemContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 2,
  },
});

export default styles;
