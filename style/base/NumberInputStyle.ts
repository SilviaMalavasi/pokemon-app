import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.padding.small,
    marginBottom: theme.padding.small,
    width: "100%",
    backgroundColor: "transparent",
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.placeholder,
  },
  input: {
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.textHilight,
  },
  picker: {
    width: 46,
    height: 46,
    borderRadius: 4,
    paddingLeft: 18,
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.placeholder,
    marginBottom: 0,
    marginRight: 4,
  },
  selected: {
    color: theme.colors.placeholder,
  },
  listContainer: {
    backgroundColor: theme.colors.background,
    borderWidth: 0,
  },
  listItem: {
    color: theme.colors.placeholder,
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
