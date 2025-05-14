import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: theme.padding.xsmall,
    bottom: theme.padding.small,
    width: vw(12),
    height: vw(12),
    backgroundColor: theme.colors.mediumGrey,
    borderWidth: 1,
    borderColor: theme.colors.green,
    ...theme.shadowSmall,
    borderRadius: theme.borderRadius.xlarge,
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
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.xlarge,
    zIndex: 0,
  },
  iconContainerStyle: {
    width: theme.padding.large,
    height: theme.padding.large,
  },
});

export default styles;
