import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const containersPadding = theme.padding.small;
const gap = theme.padding.small;
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
    position: "relative",
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
  deleteButton: {
    position: "absolute",
    width: vw(12),
    height: vw(12),
    bottom: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: theme.colors.purple,
    borderRadius: theme.borderRadius.xlarge,
    padding: 2,
    elevation: 2,
  },
});

export default styles;
