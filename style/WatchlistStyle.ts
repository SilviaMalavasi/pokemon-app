import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const WatchlistStyle = StyleSheet.create({
  cardList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: theme.padding.medium,
  },
});

export default WatchlistStyle;
