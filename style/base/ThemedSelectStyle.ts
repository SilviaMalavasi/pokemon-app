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
  pickerWrapper: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    height: theme.fontSizes.font15 * 1.25 + theme.padding.medium * 2,
  },
  selectPressable: {
    borderRadius: theme.borderRadius.medium,
    padding: theme.padding.medium,
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.25,
    color: theme.colors.grey,
  },
  modalContainer: {
    width: "100%",
    paddingHorizontal: theme.padding.medium,
    paddingTop: theme.padding.medium,
    alignItems: "flex-start",
  },
  operator: {
    marginVertical: theme.padding.small,
  },
  selectedAndHintWrapper: {
    width: "100%",
    paddingBottom: theme.padding.small,
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
    gap: theme.padding.small,
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.medium,
  },
  labelHint: {
    paddingTop: theme.padding.small,
  },
});

export default styles;
