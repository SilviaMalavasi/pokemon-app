import { StyleSheet } from "react-native";
import { Colors } from "@/style/base/Colors";

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
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
    marginTop: 3,
    marginBottom: -1,
    borderRadius: 4,
  },
  listItem: {
    color: Colors.placeholder,
    backgroundColor: Colors.inputBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumDarkGrey,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 12,
    margin: 0,
  },
  listItemActive: {
    color: Colors.highlight,
    backgroundColor: Colors.inputBackground,
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
