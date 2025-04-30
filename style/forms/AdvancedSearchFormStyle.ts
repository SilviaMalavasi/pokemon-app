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
    paddingHorizontal: theme.padding.small,
    paddingTop: theme.padding.large,
    paddingBottom: theme.padding.xlarge * 1.2,
    marginBottom: theme.padding.medium * -1,
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
    alignItems: "flex-start",
    marginBottom: 2,
  },
  summaryDotCol: {
    width: 8,
    marginRight: theme.padding.xsmall,
    marginTop: 4,
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
  summaryArrayTextSeparator: {
    color: theme.colors.green,
    fontSize: theme.fontSizes.xsmall,
  },
  mainButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingHorizontal: theme.padding.small,
  },
});

export default styles;
