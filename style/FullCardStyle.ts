import { StyleSheet } from "react-native";
import { vw } from "@/helpers/viewport";

const containersPadding = 20;
const gap = 16; // gap between cards
const columns = 2;
const cardWidth = (vw(100) - containersPadding * 2 - gap * (columns - 1)) / columns;

const FullCardStyle = StyleSheet.create({
  container: {
    flexDirection: "column",
    width: cardWidth,
    paddingVertical: 8,
  },
  imageContainer: {
    width: "100%",
    height: cardWidth / 0.71,
  },
  image: {
    width: "100%",
    height: cardWidth / 0.71,
  },
});

export default FullCardStyle;
