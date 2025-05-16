import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.padding.large * -1.5,
    paddingBottom: theme.padding.large * 1.5,
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.padding.medium,
    marginBottom: theme.padding.medium,
    gap: theme.padding.small,
  },
  numbersModal: {
    width: theme.padding.medium * 2.5,
    height: theme.padding.medium * 2.5,
    borderRadius: theme.borderRadius.xlarge,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 4,
  },
  numbersModalActive: {
    width: theme.padding.medium * 2.5,
    height: theme.padding.medium * 2.5,
    borderRadius: theme.borderRadius.xlarge,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 4,
    backgroundColor: theme.colors.purple,
  },
  numbersModalDisabled: {
    width: theme.padding.medium * 2.5,
    height: theme.padding.medium * 2.5,
    borderRadius: theme.borderRadius.xlarge,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 4,
    backgroundColor: theme.colors.lightGrey,
  },
  energyNumber: {
    width: theme.padding.xlarge,
    textAlign: "center",
    paddingBottom: theme.padding.xsmall,
  },
});

export default styles;
