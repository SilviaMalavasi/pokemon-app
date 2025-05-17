import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.padding.xsmall,
    gap: theme.padding.medium,
  },
  halfButton: {
    flexBasis: vw(50) - theme.padding.xsmall * 2,
    flexGrow: 1,
    flexShrink: 1,
    marginBottom: theme.padding.small,
  },
  switchContainer: {
    marginTop: theme.padding.medium,
    marginBottom: theme.padding.medium * 1.5,
  },
  summaryContainer: {
    position: "relative",
    zIndex: 1,
    marginTop: theme.padding.large * -1,
    paddingTop: theme.padding.xlarge,
    paddingBottom: theme.padding.large,
    paddingHorizontal: theme.padding.medium,
    borderBottomLeftRadius: theme.borderRadius.xlarge,
    borderBottomRightRadius: theme.borderRadius.xlarge,
    marginBottom: theme.padding.large,
  },
  summaryTitle: {
    paddingBottom: theme.padding.medium,
    paddingTop: theme.padding.small,
  },
  summaryItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  summaryArrayText: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  summaryArrayTextSeparator: {
    color: theme.colors.green,
    fontSize: theme.fontSizes.font14,
  },
  mainButtonsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginTop: theme.padding.xsmall,
    marginBottom: theme.padding.xsmall,
  },
  mainButtonsRowSummary: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingHorizontal: theme.padding.small,
    marginTop: theme.padding.xsmall,
    marginBottom: theme.padding.xsmall,
  },
});

export default styles;
