import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  cardList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 0,
    gap: 0,
  },
  numberButton: {
    position: "absolute",
    width: vw(12),
    height: vw(12),
    right: theme.padding.small,
    top: vw(50),
    zIndex: 10,
    borderRadius: theme.borderRadius.medium,
    padding: 2,
    backgroundColor: theme.colors.mediumGrey,
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 6,
        offsetY: 6,
        blurRadius: "12px",
      },
      {
        color: theme.colors.darkGrey,
        offsetX: -2,
        offsetY: -2,
        blurRadius: "4px",
        inset: true,
      },
    ],
  },
  button: {
    position: "relative",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  numberStyle: {
    fontSize: theme.fontSizes.font18,
    textAlign: "center",
    color: theme.colors.green,
  },
  iconContainerStyle: {
    width: theme.padding.large * 0.75,
    height: theme.padding.large * 0.75,
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
  cardItem: {
    width: (vw(100) - theme.padding.medium * 2 - theme.padding.medium) / 2,
    marginBottom: theme.padding.medium,
    position: "relative",
  },
});

export default styles;
