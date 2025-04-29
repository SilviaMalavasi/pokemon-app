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
    color: theme.colors.text,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: 8,
    marginBottom: 8,
    width: "100%",
    fontSize: 16,
  },
  selectedStyle: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.text,
    padding: theme.padding.xsmall,
    backgroundColor: theme.colors.background,
  },
  selectedItemText: {
    color: theme.colors.text,
    fontSize: 16,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
});

export default styles;
