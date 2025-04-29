import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: theme.padding.small,
    width: "100%",
    backgroundColor: "transparent",
  },
  container: {
    marginBottom: theme.padding.small,
    borderRadius: theme.borderRadius.small,
    backgroundColor: "transparent",
  },
  label: {
    position: "absolute",
    top: theme.padding.xsmall * -1,
    left: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: theme.padding.xsmall,
    paddingHorizontal: theme.padding.xsmall,
  },
  labelHintIcon: {
    height: theme.fontSizes.small,
    width: theme.fontSizes.small,
    marginLeft: theme.padding.xsmall,
  },
  selectPressable: {
    paddingVertical: theme.padding.small,
    paddingHorizontal: theme.padding.small,
    color: theme.colors.placeholder,
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
  pickerWrapper: {
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.text,
    width: "100%",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.padding.small,
  },
  modalActionCancel: {
    marginRight: 16,
  },
  selectedAndHintWrapper: {
    backgroundColor: "transparent",
    alignItems: "flex-start",
  },
  selectedWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: theme.padding.xsmall,
    backgroundColor: "transparent",
    paddingBottom: theme.padding.small,
  },
  labelHint: {
    paddingTop: theme.padding.xsmall,
  },
});

export default styles;
