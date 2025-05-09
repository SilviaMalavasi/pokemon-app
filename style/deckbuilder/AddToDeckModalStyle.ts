import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderRadius: 8,
    padding: theme.padding.small,
    marginBottom: theme.padding.small,
    width: "100%",
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
  deckRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.padding.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  deckName: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyText: {
    fontSize: 14,
    color: theme.colors.textAlternative,
    marginRight: 4,
  },
  addButton: {
    marginLeft: 4,
  },
  addButtonTrigger: {
    position: "absolute",
    width: vw(12),
    height: vw(12),
    right: theme.padding.xsmall * 0.5,
    bottom: theme.padding.small * 0.5,
    zIndex: 10,
    borderRadius: theme.borderRadius.xlarge,
    padding: 2,
    backgroundColor: theme.colors.lightBackground,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    ...theme.shadow,
  },
  button: {
    position: "relative",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: vw(12),
    height: vw(12),
    borderRadius: theme.borderRadius.xlarge,
    zIndex: 0,
  },
  iconContainerStyle: {
    width: theme.padding.large * 0.75,
    height: theme.padding.large * 0.75,
  },
});

export default styles;
