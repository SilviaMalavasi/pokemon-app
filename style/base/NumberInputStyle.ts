import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

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
  input: {
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
    color: Colors.highlight,
  },
  picker: {
    width: 46,
    height: 46,
    borderRadius: 4,
    paddingLeft: 18,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
    color: Colors.placeholder,
    marginBottom: 0,
    marginRight: 4,
  },
  selected: {
    color: Colors.placeholder,
  },
  listContainer: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 0,
  },
  listItem: {
    color: Colors.placeholder,
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
});

export default styles;
