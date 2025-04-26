import { StyleSheet } from "react-native";
import { Colors } from "@/style/base/Colors";

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter-Black",
    fontSize: 36,
    lineHeight: 36,
    paddingBottom: 16,
    color: Colors.text,
    paddingTop: 4,
  },
  subtitle: {
    fontFamily: "Inter-ExtraBold",
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  default: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  defaultSemiBold: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  link: {
    fontFamily: "Inter-Regular",
    lineHeight: 30,
    fontSize: 16,
    color: Colors.highlight,
  },
  button: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    lineHeight: 24,
    textTransform: "uppercase",
    color: Colors.text,
  },
  buttonAlternative: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    lineHeight: 24,
    textTransform: "uppercase",
    color: Colors.text,
  },
  buttonDisabled: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    lineHeight: 24,
    textTransform: "uppercase",
    color: Colors.text,
  },
  hintIcon: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
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
    fontFamily: "Inter-Regular",
    fontSize: 14,
    lineHeight: 15,
    color: Colors.lightPurple,
    marginTop: 6,
    marginBottom: 16,
  },
});

export default styles;
