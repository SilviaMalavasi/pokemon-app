import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  default: {
    backgroundColor: Colors.highlight,
    color: Colors.text,
  },
  alternative: {
    backgroundColor: Colors.alternativeText,
    color: Colors.text,
  },
  disabled: {
    backgroundColor: Colors.lightBackground,
    color: Colors.text,
  },
  gradient: {
    borderRadius: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
    ...StyleSheet.absoluteFillObject,
  },
  touchable: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  alternativeGradient: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
