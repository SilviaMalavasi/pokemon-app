import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw, vh } from "@/helpers/viewport";

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: theme.padding.xsmall,
    bottom: theme.padding.small,
    width: vw(16),
    height: vw(16),
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xlarge,
    shadowColor: theme.colors.lightPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 5,
    zIndex: 100,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: theme.borderRadius.xlarge,
  },
  button: {
    position: "relative",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerStyle: {
    width: theme.padding.xlarge,
    height: theme.padding.xlarge,
  },
});

export default styles;
