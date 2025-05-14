import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

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
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.small * 0.9,
    fontSize: theme.fontSizes.font18,
    lineHeight: theme.fontSizes.font18 * 1.25,
    color: theme.colors.green,
    borderWidth: 1,
    borderColor: theme.colors.grey,
  },
  clearIcon: {
    position: "absolute",
    right: theme.padding.small,
    top: 2,
    bottom: 0,
    justifyContent: "center",
    height: "100%",
    width: theme.fontSizes.font24,
    padding: 4,
    zIndex: 2,
  },
  labelHint: {
    paddingTop: theme.padding.small,
  },
  pickerWrapper: {
    width: vw(12),
    height: vw(13.8),
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  selectPressable: {
    fontSize: theme.fontSizes.font24,
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.small * 0.9,
    paddingHorizontal: theme.padding.small,
    color: theme.colors.grey,
    borderRadius: theme.borderRadius.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
  },
  modalContainer: {
    marginHorizontal: theme.padding.large,
    backgroundColor: theme.colors.mediumGrey,
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
    color: theme.colors.grey,
    fontSize: theme.fontSizes.font24,
    marginHorizontal: theme.padding.xsmall,
  },
  selectedOperator: {
    color: theme.colors.purple,
    fontSize: theme.fontSizes.font24,
    marginHorizontal: theme.padding.xsmall,
    fontWeight: "bold",
  },
});

export default styles;
