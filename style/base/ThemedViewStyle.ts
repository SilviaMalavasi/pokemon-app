import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  containerBig: {
    borderRadius: theme.borderRadius.xlarge,
    marginTop: theme.padding.medium,
    overflow: "hidden",
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: -16,
        blurRadius: "20px",
      },
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: 16,
        blurRadius: "20px",
      },
    ],
  },
  containerBigInner: {
    padding: theme.padding.medium,
    boxShadow: [
      {
        offsetX: 1,
        offsetY: 2,
        blurRadius: "2px",
        color: theme.colors.shadowInsetLight,
        inset: true,
      },
    ],
  },
  containerRounded: {
    marginTop: theme.padding.medium,
    borderRadius: theme.borderRadius.xlarge * 1.5,
    overflow: "hidden",
    width: "100%",
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: -16,
        blurRadius: "20px",
      },
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: 16,
        blurRadius: "20px",
      },
    ],
  },
  containerRoundedInner: {
    flexDirection: "row",
    width: "100%",
    padding: theme.padding.medium,
    borderRadius: theme.borderRadius.xlarge * 1.5,
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: [
      {
        offsetX: 1,
        offsetY: 2,
        blurRadius: "2px",
        color: theme.colors.shadowInsetLight,
        inset: true,
      },
    ],
  },
  containerBox: {
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.mediumGrey,
    padding: theme.padding.medium,
    boxShadow: [
      {
        color: theme.colors.shadowLight,
        offsetX: -2,
        offsetY: -2,
        blurRadius: "2px",
      },
      {
        color: theme.colors.darkGrey,
        offsetX: 6,
        offsetY: 6,
        blurRadius: "12px",
      },
    ],
  },
});

export default styles;
