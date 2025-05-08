import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.padding.small,
    marginBottom: theme.padding.medium,
  },
  cardInput: {
    flex: 2,
  },
  numberInput: {
    flex: 1,
  },
  saveButton: {
    width: vw(14),
    height: vw(14),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.xlarge,
    padding: 2,
    backgroundColor: theme.colors.lightBackground,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    ...theme.shadow,
  },
  iconContainerStyle: {
    width: theme.padding.large * 0.75,
    height: theme.padding.large * 0.75,
  },
  saveButtonDisabled: {
    //opacity: 0.5,
  },
});

export default styles;
