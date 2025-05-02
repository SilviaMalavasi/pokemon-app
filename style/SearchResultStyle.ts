import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const SearchResultStyle = StyleSheet.create({
  cardList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 0,
    gap: 0,
    marginTop: theme.padding.small,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.padding.xlarge,
    marginBottom: theme.padding.small,
  },
  paginationText: {
    marginHorizontal: theme.padding.small,
    paddingBottom: theme.padding.xsmall,
  },
});

export default SearchResultStyle;
