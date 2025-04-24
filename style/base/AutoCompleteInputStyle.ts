import { StyleSheet } from "react-native";
import { Colors } from "@/style/base/Colors";

const AutoCompleteInputStyle = StyleSheet.create({
  label: {
    marginBottom: 4,
    fontSize: 16,
    color: Colors.text,
  },
  inputContainer: {
    borderRadius: 4,
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 0,
    paddingVertical: 4,
    marginBottom: 12,
    color: Colors.placeholder,
  },
  suggestionsListContainer: {
    borderRadius: 4,
    backgroundColor: Colors.inputBackground,
  },
  suggestionsListText: {
    color: Colors.placeholder,
  },
  customItem: {
    color: Colors.placeholder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
});

export default AutoCompleteInputStyle;
