import { StyleSheet } from "react-native";
import { Colors } from "@/style/base/Colors";

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.placeholder,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  clearIcon: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    height: "100%",
    zIndex: 1,
  },
  input: {
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
    color: Colors.highlight,
    paddingRight: 36,
  },
});

export default styles;
