import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: vw(48),
    justifyContent: "space-between",
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
  title: {
    paddingTop: theme.padding.medium,
    paddingLeft: theme.padding.medium,
    zIndex: 2,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    zIndex: 2,
    width: "100%",
    padding: theme.padding.medium,
  },
  deckNameEdit: {
    width: "60%",
    maxWidth: "60%",
    minWidth: "60%",
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  buttonContainer: {
    width: "35%",
    maxWidth: "35%",
    minWidth: "35%",
    marginLeft: "5%",
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
});

export default styles;
