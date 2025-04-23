import { StyleSheet } from "react-native";

const CompactCardViewStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
  },
  imageContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
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
