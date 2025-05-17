import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    width: "100%",
    height: vw(48),
    marginBottom: theme.padding.large,
    backgroundColor: theme.colors.darkGrey,
    borderRadius: theme.borderRadius.large,
    overflow: "hidden",
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 8,
        offsetY: 8,
        blurRadius: "12px",
      },
    ],
  },
  imageContainer: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    left: 0,
    width: vw(125) - theme.padding.medium * 2,
    height: (vw(125) - theme.padding.medium * 2) * 1.395,
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: theme.borderRadius.large,
    overflow: "hidden",
    zIndex: 2,
    top: 0,
    left: 0,
  },
  image: {
    position: "absolute",
    width: vw(125) - theme.padding.medium * 2,
    height: (vw(125) - theme.padding.medium * 2) * 1.395,
    top: -vw(27.5),
    left: -vw(12.5),
  },
  mainContainer: {
    position: "relative",
    zIndex: 3,
    width: "100%",
    flexDirection: "row",
    padding: theme.padding.medium,
  },
  deckName: {
    width: "50%",
    maxWidth: "50%",
    minWidth: "50%",
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  deckButtons: {
    width: "45%",
    maxWidth: "45%",
    minWidth: "45%",
    marginLeft: "5%",
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
  },
  iconContainerStyle: {
    width: theme.padding.large * 0.75,
    height: theme.padding.large * 0.75,
  },
});

export default styles;
