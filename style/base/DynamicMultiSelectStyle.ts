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
  picker: {
    borderRadius: 4,
    paddingTop: 6,
    paddingBottom: 2,
    paddingHorizontal: 8,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
    color: Colors.placeholder,
    marginBottom: 8,
  },
  listContainer: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 0,
  },
  listItem: {
    color: Colors.placeholder,
  },
  listItemActive: {
    color: Colors.placeholder,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  selectedStyle: {
    borderRadius: 12,
    borderColor: Colors.highlight,
  },
  selectedItemText: {
    color: Colors.highlight,
    fontSize: 16,
  },
});

export default styles;
