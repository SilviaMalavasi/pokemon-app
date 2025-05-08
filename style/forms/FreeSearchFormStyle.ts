import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  switchContainer: {
    marginTop: theme.padding.medium,
    marginBottom: theme.padding.xlarge,
  },
  instructions: {
    paddingTop: theme.padding.medium,
    paddingBottom: theme.padding.small,
  },
  mainButtonsRow: {
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
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.colors.green,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.padding.small,
    paddingTop: theme.padding.medium,
    paddingBottom: theme.padding.medium,
    marginTop: theme.padding.small,
    marginBottom: theme.padding.small,
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
  summaryDotCol: {
    width: theme.padding.xsmall,
    marginRight: theme.padding.xsmall,
    marginTop: theme.padding.xsmall,
  },
  summaryTextCol: {
    flex: vw(100) - 8 - theme.padding.xlarge * 2,
    minWidth: vw(100) - 8 - theme.padding.xlarge * 2,
  },
  summaryArrayText: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  summaryText: {
    fontSize: theme.fontSizes.small,
  },
  summaryArrayTextSeparator: {
    color: theme.colors.green,
    fontSize: theme.fontSizes.xsmall,
  },
});

export default styles;
