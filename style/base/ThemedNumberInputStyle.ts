import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.padding.small,
    marginBottom: theme.padding.small,
    width: "100%",
    backgroundColor: "transparent",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderRadius: theme.borderRadius.small,
    paddingLeft: theme.padding.small,
    paddingRight: theme.padding.small,
    paddingTop: theme.padding.small * 1.25,
    paddingBottom: theme.padding.small,
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.25,
    color: theme.colors.textHilight,
    borderWidth: 1,
    borderColor: theme.colors.text,
  },
  clearIcon: {
    position: "absolute",
    right: theme.padding.small,
    top: 2,
    bottom: 0,
    justifyContent: "center",
    height: "100%",
    width: theme.fontSizes.large,
    padding: 4,
    zIndex: 2,
  },
  labelHint: {
    paddingTop: theme.padding.small,
  },
  pickerWrapper: {
    width: 45,
    height: 55,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.text,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  selectPressable: {
    fontSize: theme.fontSizes.large,
    paddingTop: theme.padding.small * 1.5,
    paddingBottom: theme.padding.small * 0.9,
    paddingHorizontal: theme.padding.small,
    color: theme.colors.placeholder,
    borderRadius: theme.borderRadius.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
  },
  modalContainer: {
    marginHorizontal: theme.padding.large,
    backgroundColor: theme.colors.lightBackground,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.purple,
    paddingHorizontal: theme.padding.medium,
    paddingVertical: theme.padding.large,
    ...theme.shadowAlternative,
  },
  modalOption: {
    paddingVertical: theme.padding.small,
    paddingHorizontal: theme.padding.small,
    alignItems: "center",
  },
  modalCancel: {
    marginTop: theme.padding.small,
    alignItems: "center",
  },
  operator: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.large,
    marginHorizontal: theme.padding.xsmall,
  },
  selectedOperator: {
    color: theme.colors.purple,
    fontSize: theme.fontSizes.large,
    marginHorizontal: theme.padding.xsmall,
    fontWeight: "bold",
  },
});

export default styles;
