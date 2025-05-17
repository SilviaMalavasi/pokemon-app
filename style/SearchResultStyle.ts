import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  wrapper: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 0,
    gap: 0,
  },
  paginationText: {
    marginHorizontal: theme.padding.small,
    paddingBottom: theme.padding.xsmall,
  },
});

export default styles;
