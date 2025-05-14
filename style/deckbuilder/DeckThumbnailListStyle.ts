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
    right: theme.padding.xsmall * 0.5,
    top: vw(48),
    zIndex: 10,
    borderRadius: theme.borderRadius.xlarge,
    padding: 2,
    backgroundColor: theme.colors.mediumGrey,
    borderWidth: 1,
    borderColor: theme.colors.green,
    ...theme.shadow,
  },
  button: {
    position: "relative",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  numberStyle: {
    fontSize: vw(6),
    lineHeight: vw(6),
    textAlign: "center",
    fontWeight: "bold",
  },
  iconContainerStyle: {
    width: theme.padding.large * 0.75,
    height: theme.padding.large * 0.75,
  },
  numbersModalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingTop: theme.padding.medium,
    backgroundColor: "transparent",
  },
  numbersModal: {
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.green,
    paddingHorizontal: theme.padding.small,
    paddingVertical: theme.padding.xsmall * 1.2,
    marginHorizontal: 4,
  },
});

export default styles;
