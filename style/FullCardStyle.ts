import { StyleSheet } from "react-native";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";

const containersPadding = 16;
const cardWidth = vw(100) - containersPadding;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "column",
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: vw(100) - theme.padding.small * 2,
    height: cardWidth / 0.71,
    marginBottom: 32,
  },
  image: {
    width: "100%",
    height: cardWidth / 0.71,
  },
});

export default styles;
