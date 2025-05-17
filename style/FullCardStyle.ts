import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const containersPadding = theme.padding.medium;
const cardWidth = vw(100) - containersPadding * 2;

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    justifyContent: "center",
    width: cardWidth,
    marginBottom: theme.padding.xlarge,
    borderRadius: theme.borderRadius.large,
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
  summaryContainer: {
    position: "relative",
    zIndex: 1,
    marginTop: theme.padding.large * -1,
    paddingTop: theme.padding.xlarge * 0.75,
    paddingBottom: theme.padding.large,
    paddingHorizontal: theme.padding.medium,
    borderBottomLeftRadius: theme.borderRadius.xlarge,
    borderBottomRightRadius: theme.borderRadius.xlarge,
    marginBottom: theme.padding.large,
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: 16,
        blurRadius: "20px",
      },
    ],
  },
  cardDetailsContainer: {
    position: "relative",
    paddingTop: theme.padding.medium,
    paddingBottom: theme.padding.small,
  },
  title: {
    paddingBottom: theme.padding.small,
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
