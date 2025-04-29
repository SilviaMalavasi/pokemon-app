import { StyleSheet, StatusBar, Platform } from "react-native";
import { theme } from "@/style/ui/Theme";

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
    padding: 24,
    alignItems: "center",
    ...theme.shadow,
    width: "92%",
    maxWidth: 400,
    marginHorizontal: "auto",
  },
});

export default styles;
