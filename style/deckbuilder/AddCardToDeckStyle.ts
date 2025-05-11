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
  numbersModalContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.padding.medium,
    marginBottom: theme.padding.medium,
    gap: theme.padding.small,
  },
  numbersModal: {
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.green,
    paddingHorizontal: theme.padding.small,
    paddingVertical: theme.padding.xsmall * 1.2,
    marginHorizontal: 4,
  },
});

export default styles;
