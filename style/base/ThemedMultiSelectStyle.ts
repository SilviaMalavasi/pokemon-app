import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.padding.small,
    width: "100%",
  },
  fakeInnerShadow: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.lightGrey,
    boxShadow: [
      {
        offsetX: 6,
        offsetY: 8,
        blurRadius: "30px",
        color: theme.colors.darkGrey,
        inset: true,
      },
    ],
  },
  selectPressable: {
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.padding.medium * 0.8,
    paddingHorizontal: theme.padding.medium,
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.25,
    color: theme.colors.grey,
  },
  pickerWrapper: {
    position: "relative",
    zIndex: 2,
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
  },
  modalContainer: {
    width: "100%",
    paddingHorizontal: theme.padding.medium,
    paddingTop: theme.padding.medium,
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
    width: "100%",
  },
  selectedWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: theme.padding.small,
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.medium,
  },
  labelHint: {
    paddingBottom: theme.padding.medium,
  },
});

export default styles;
