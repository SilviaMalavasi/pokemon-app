import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    position: "relative",
    zIndex: 2,
    borderRadius: theme.borderRadius.medium,
    padding: theme.padding.medium,
    fontSize: theme.fontSizes.font15,
    lineHeight: theme.fontSizes.font15 * 1.25,
    color: theme.colors.green,
  },
  clearIcon: {
    position: "absolute",
    right: theme.padding.small,
    top: 2,
    bottom: 0,
    justifyContent: "center",
    height: "100%",
    width: theme.fontSizes.font18,
    zIndex: 2,
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
    width: vw(12),
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: theme.padding.xsmall,
  },
  selectPressable: {
    fontSize: theme.fontSizes.font24,
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.small * 0.9,
    paddingHorizontal: theme.padding.small,
    color: theme.colors.grey,
    borderRadius: theme.borderRadius.small,
  },
  numbersModalContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.padding.medium,
    marginBottom: theme.padding.medium,
    gap: theme.padding.small,
    width: vw(40),
  },
  numbersModal: {
    width: theme.padding.medium * 2.5,
    height: theme.padding.medium * 2.5,
    borderRadius: theme.borderRadius.xlarge,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 4,
  },
});

export default styles;
