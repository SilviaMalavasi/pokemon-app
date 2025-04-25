import { StyleSheet } from "react-native";
import { vw } from "@/helpers/viewport";

const containersPadding = 16;
const cardWidth = vw(100) - containersPadding;

const FullCardStyle = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  imageContainer: {
    width: "100%",
    height: cardWidth / 0.71,
    marginBottom: 32,
  },
  image: {
    width: "100%",
    height: cardWidth / 0.71,
  },
});

export default FullCardStyle;
