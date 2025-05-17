import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.padding.xsmall,
    paddingBottom: theme.padding.xsmall,
  },
  content: {
    marginTop: theme.padding.small,
  },
});

export default styles;
