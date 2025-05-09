import { StyleSheet } from "react-native";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";

const containersPadding = 16;
const cardWidth = vw(100) - containersPadding;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "column",
    paddingBottom: theme.padding.large * 2,
  },
  imageContainer: {
    position: "relative",
    justifyContent: "center",
    width: vw(100) - theme.padding.small * 2,
    height: cardWidth / 0.71,
    marginBottom: theme.padding.large,
  },
  image: {
    width: "100%",
    height: cardWidth / 0.71,
  },
  cardDetailsContainer: {
    position: "relative",
    borderWidth: 1,
    borderColor: theme.colors.purple,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.padding.small,
    paddingTop: theme.padding.medium,
    paddingBottom: theme.padding.small,
    marginBottom: theme.padding.large,
  },
  cardDetailsLabel: {
    position: "absolute",
    top: theme.padding.xsmall * -1,
    left: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: theme.padding.xsmall,
    paddingHorizontal: theme.padding.xsmall,
  },
  cardDetailsItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
});

export default styles;
