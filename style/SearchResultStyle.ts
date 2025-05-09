import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const SearchResultStyle = StyleSheet.create({
  cardList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 0,
    gap: 0,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.padding.medium,
    paddingBottom: theme.padding.xlarge * 2,
  },
  paginationText: {
    marginHorizontal: theme.padding.small,
    paddingBottom: theme.padding.xsmall,
  },
});

export default SearchResultStyle;
