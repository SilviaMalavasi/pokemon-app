import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 4,
  },
  containerLarge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  containerSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  default: {
    backgroundColor: Colors.highlight,
    color: Colors.darkText,
  },
  alternative: {
    backgroundColor: Colors.alternativeText,
    color: Colors.text,
  },
  disabled: {
    backgroundColor: Colors.lightBackground,
    color: Colors.text,
  },
  touchable: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
