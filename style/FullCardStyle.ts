import { StyleSheet } from "react-native";
import { vw } from "@/helpers/viewport";

const containersPadding = 20;
const gap = 16; // gap between cards
const columns = 2;
const cardWidth = (vw(100) - containersPadding * 2 - gap * (columns - 1)) / columns;

const FullCardStyle = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: cardWidth,
    paddingVertical: 8,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  image: {
    width: "100%",
    height: cardWidth / 0.71,
  },
});

export default FullCardStyle;
