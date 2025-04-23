import { StyleSheet } from "react-native";

const CompactCardViewStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  imageContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 8,
    justifyContent: "center",
    paddingLeft: 12,
  },
  image: {
    width: 50,
    height: 70,
  },
});

export default CompactCardViewStyle;
