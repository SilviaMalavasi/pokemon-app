import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const containersPadding = theme.padding.medium;
const gap = theme.padding.medium;
const columns = 2;
const cardWidth = (vw(100) - containersPadding * 2 - gap * (columns - 1)) / columns;

const styles = StyleSheet.create({
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
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 6,
        offsetY: 6,
        blurRadius: "12px",
      },
      {
        color: theme.colors.darkGrey,
        offsetX: -2,
        offsetY: -2,
        blurRadius: "4px",
        inset: true,
      },
    ],
  },
  image: {
    width: "100%",
    height: cardWidth / 0.71,
  },
  textContainer: {
    width: "100%",
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.medium,
  },
});

export default styles;
