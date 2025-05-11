import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const containersPadding = theme.padding.medium;
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
    right: theme.padding.xsmall * 0.5,
    bottom: theme.padding.small * 0.5,
    zIndex: 10,
    borderRadius: theme.borderRadius.xlarge,
    padding: 2,
    backgroundColor: theme.colors.lightBackground,
    borderWidth: 1,
    borderColor: theme.colors.green,
    ...theme.shadow,
  },
  button: {
    position: "relative",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: vw(12),
    height: vw(12),
    borderRadius: theme.borderRadius.xlarge,
    zIndex: 0,
  },
  iconContainerStyle: {
    width: theme.padding.large * 0.75,
    height: theme.padding.large * 0.75,
  },
});

export default styles;
