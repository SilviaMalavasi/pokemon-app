import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.padding.small,
    paddingVertical: theme.padding.xsmall,
  },
  content: {
    marginTop: theme.padding.small,
    marginLeft: theme.padding.large + theme.padding.xsmall,
  },
});

export default styles;
