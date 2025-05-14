import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: theme.padding.small,
    width: "100%",
    backgroundColor: "transparent",
  },
  container: {
    paddingTop: theme.padding.small,
    borderRadius: theme.borderRadius.small,
    backgroundColor: "transparent",
  },
  selectPressable: {
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.small * 0.9,
    paddingHorizontal: theme.padding.small,
    color: theme.colors.grey,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.darkGrey,
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
  pickerWrapper: {
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    width: "100%",
  },
  operator: {
    color: theme.colors.grey,
    marginHorizontal: theme.padding.xsmall,
    paddingVertical: theme.padding.xsmall,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.padding.small,
  },
  modalActionCancel: {
    marginRight: theme.padding.small,
  },
  selectedAndHintWrapper: {
    backgroundColor: "transparent",
    alignItems: "flex-start",
  },
  touchableOpacity: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  touchableOpacityLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.padding.xsmall,
  },
  labelHintIcon: {
    height: theme.fontSizes.font16,
    width: theme.fontSizes.font16,
    marginLeft: theme.padding.xsmall,
  },
  selectedWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: theme.padding.xsmall,
    backgroundColor: "transparent",
    paddingTop: theme.padding.xsmall,
  },
  labelHint: {
    paddingTop: theme.padding.xsmall,
  },
});

export default styles;
