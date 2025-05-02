import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  switchContainer: {
    marginTop: theme.padding.medium,
    marginBottom: theme.padding.xlarge,
  },
  instructions: {
    paddingTop: theme.padding.xsmall,
    paddingBottom: theme.padding.large,
  },
  mainButtonsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingHorizontal: theme.padding.small,
    marginTop: theme.padding.xsmall,
    marginBottom: theme.padding.medium,
  },
  collapsibleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: theme.padding.small,
  },
  collapsibleItem: {
    flex: "50%",
    width: "50%",
    minWidth: "50%",
  },
});

export default styles;
