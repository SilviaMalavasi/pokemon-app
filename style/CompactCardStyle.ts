import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const containersPadding = theme.padding.medium;
const gap = theme.padding.small;
const columns = 2;
const cardWidth = (vw(100) - containersPadding * 2 - gap * (columns - 1)) / columns;

const CompactCardViewStyle = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: cardWidth,
    paddingTop: theme.padding.xsmall,
    paddingBottom: theme.padding.small,
  },
  imageContainer: {
    width: "100%",
    height: cardWidth / 0.71,
  },
  image: {
    width: "100%",
    height: cardWidth / 0.71,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: theme.padding.xsmall,
  },
});

export default CompactCardViewStyle;
