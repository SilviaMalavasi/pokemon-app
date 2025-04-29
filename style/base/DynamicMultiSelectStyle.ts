import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.padding.small,
    width: "100%",
  },
  label: {
    position: "absolute",
    top: theme.padding.xsmall,
    left: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: theme.padding.xsmall,
    paddingHorizontal: theme.padding.xsmall,
  },
  picker: {
    color: theme.colors.placeholder,
    marginBottom: 8,
    width: "100%",
  },
  listContainer: {
    backgroundColor: theme.colors.lightGrey,
    borderWidth: 0,
    marginTop: 3,
    marginBottom: -1,
    borderRadius: 4,
    zIndex: 1000, // Ensure dropdown is above other elements
    elevation: 10, // For Android
  },
  listItem: {
    color: theme.colors.placeholder,
    backgroundColor: theme.colors.lightGrey,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 12,
    margin: 0,
  },
  listItemActive: {
    color: theme.colors.textHilight,
    backgroundColor: theme.colors.lightGrey,
  },
  selectedStyle: {
    borderRadius: 12,
    borderColor: theme.colors.text,
  },
  selectedItemText: {
    color: theme.colors.text,
    fontSize: 16,
  },
});

export default styles;
