import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

const AutoCompleteInputStyle = StyleSheet.create({
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
  dropdown: {
    left: 0,
    right: 0,
    backgroundColor: Colors.inputBackground,
    borderRadius: 4,
    zIndex: 1000,
    maxHeight: 150,
    marginTop: 4, // Add margin to separate from input
  },
  dropdownItem: {
    color: Colors.placeholder,
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.darkGrey,
  },
});

export default AutoCompleteInputStyle;
