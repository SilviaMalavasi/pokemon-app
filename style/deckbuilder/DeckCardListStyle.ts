import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  summaryItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },

  cardId: {
    textTransform: "uppercase",
    color: theme.colors.purple,
    fontSize: theme.fontSizes.font14,
  },
  summaryTextCol: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: theme.padding.xsmall,
  },
  summaryTextCardNameCols: {
    flexDirection: "row",
  },
  summaryTextCardQtyCol: {
    color: theme.colors.green,
    width: theme.padding.medium,
  },
  summaryTextCardName: {
    flex: vw(100) - theme.padding.medium * 2 - theme.padding.large - theme.padding.medium,
  },
  qtyCol: { flexDirection: "row", alignItems: "center" },
  qtyOperator: {
    width: theme.padding.large,
    height: theme.padding.large,
    borderRadius: theme.borderRadius.xlarge,
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: theme.padding.xsmall,
    marginLeft: theme.padding.medium,
    marginTop: theme.padding.xsmall * -1,
  },
});

export default styles;
