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
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "900",
    textTransform: "uppercase",
    color: Colors.text,
  },
  buttonAlternative: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "900",
    textTransform: "uppercase",
    color: Colors.text,
  },
  buttonDisabled: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "900",
    textTransform: "uppercase",
    color: Colors.text,
  },
  hintIcon: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 12,
    color: Colors.alternativeText,
    borderWidth: 1,
    borderColor: Colors.alternativeText,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 0,
    marginLeft: 6,
    marginTop: -2,
  },
  hintText: {
    fontSize: 14,
    lineHeight: 15,
    color: Colors.alternativeText,
    marginTop: 6,
    marginBottom: 8,
  },
});

export default styles;
