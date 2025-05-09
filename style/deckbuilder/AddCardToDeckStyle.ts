import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.padding.medium,
  },
  title: {
    paddingBottom: theme.padding.xsmall,
  },
  row: {
    flexDirection: "row",
    gap: theme.padding.xsmall,
    marginBottom: theme.padding.medium,
  },
  cardInput: {
    flex: 2,
  },
  numberInput: {
    width: vw(22),
  },
  saveButton: {
    width: vw(14),
    height: vw(14),
    marginTop: theme.padding.small,
    paddingLeft: theme.padding.small,
  },
});

export default styles;
