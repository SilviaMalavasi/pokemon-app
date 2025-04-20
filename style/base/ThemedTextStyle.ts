import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
    paddingBottom: 16,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: Colors.highlight,
  },
  button: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  buttonAlternative: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  buttonDisabled: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    color: Colors.text,
  },
});

export default styles;
