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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalView: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%", // Take full width of parent
    maxWidth: 400, // Limit modal max width for large screens
    marginHorizontal: 0, // theme.padding.xlarge
    // Height is auto by default
  },
  message: {
    marginBottom: 20,
    textAlign: "center",
    color: theme.colors.text,
    fontSize: 18,
  },
  button: {
    alignSelf: "center",
    minWidth: 100,
    height: 40, // Make button height normal
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

export default styles;
