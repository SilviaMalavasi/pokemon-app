import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  instructions: {
    paddingTop: theme.padding.medium,
    paddingBottom: theme.padding.large,
    color: theme.colors.grey,
  },
  mainButtonsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginTop: theme.padding.xsmall,
    marginBottom: theme.padding.xsmall,
  },
  switchContainer: {
    marginTop: theme.padding.medium,
    marginBottom: theme.padding.large,
    marginLeft: theme.padding.medium,
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
  collapsibleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: theme.padding.small,
  },
  collapsibleItem: {
    flex: 0.5,
    width: "50%",
    minWidth: "50%",
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
    paddingBottom: theme.padding.small,
    paddingTop: theme.padding.small,
  },
  summaryLabel: {
    position: "absolute",
    top: theme.padding.xsmall * -1.25,
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
});

export default styles;
