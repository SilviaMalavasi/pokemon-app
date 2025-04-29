import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  iOSBackdrop: {
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  androidBackdrop: {
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    margin: theme.padding.medium,
    ...theme.shadow,
  },
  modalView: {
    backgroundColor: theme.colors.lightBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    paddingVertical: theme.padding.medium,
    paddingHorizontal: theme.padding.xsmall,
    alignItems: "center",
    justifyContent: "space-between",
    width: "92%",
    ...theme.shadow,
  },
  scrollView: {
    width: "100%",
    paddingHorizontal: theme.padding.small,
  },
  button: {
    marginTop: theme.padding.medium,
  },
});

export default styles;
