import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.padding.xsmall,
  },
  halfButton: {
    flexBasis: "48%",
    flexGrow: 1,
    flexShrink: 1,
  },
});

export default styles;
