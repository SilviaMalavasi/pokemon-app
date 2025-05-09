import { StyleSheet } from "react-native";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 0,
    top: theme.padding.xlarge * -1.2,
    width: vw(12),
    height: vw(12),
    backgroundColor: theme.colors.lightBackground,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    ...theme.shadowSmall,
    borderRadius: theme.borderRadius.xlarge,
    zIndex: 100,
  },
  fabInnerView: {
    position: "relative",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fabIconView: {
    width: theme.padding.large,
    height: theme.padding.large,
  },
});

export default styles;
