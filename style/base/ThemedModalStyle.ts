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
    ...theme.shadow,
  },
  modalView: {
    backgroundColor: theme.colors.darkGrey,
    borderRadius: theme.borderRadius.large,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    width: "85%",
    boxShadow: [
      {
        color: theme.colors.shadowLight,
        offsetX: -2,
        offsetY: -2,
        blurRadius: "2px",
      },
      {
        color: theme.colors.black,
        offsetX: 6,
        offsetY: 6,
        blurRadius: "12px",
      },
    ],
  },
  mainModal: {
    width: "100%",
    padding: theme.padding.medium,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.padding.medium,
    padding: theme.padding.medium,
  },
});

export default styles;
