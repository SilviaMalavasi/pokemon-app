import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  title: {
    paddingBottom: theme.padding.small,
  },
  summaryContainer: {
    position: "relative",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.purple,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.padding.small,
    paddingTop: theme.padding.medium,
    paddingBottom: theme.padding.small,
    marginTop: theme.padding.small,
    marginBottom: theme.padding.xsmall,
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
    marginTop: theme.padding.xsmall,
  },
  summaryitemQuantity: {
    width: theme.padding.small,
    alignItems: "center",
    marginRight: 4,
  },
  cardId: {
    textTransform: "uppercase",
  },
  summaryTextCol: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flex: vw(100) - 8 - theme.padding.xlarge * 2,
    minWidth: vw(100) - 8 - theme.padding.xlarge * 2,
  },
  qtyCol: { flexDirection: "row", alignItems: "center" },
  qtyOperator: {
    fontSize: theme.fontSizes.large,
    paddingHorizontal: 4,
    marginTop: theme.padding.xsmall * -0.5,
  },
});

export default styles;
