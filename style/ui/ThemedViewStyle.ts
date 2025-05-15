import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  containerBig: {
    borderRadius: theme.borderRadius.xlarge,
    marginTop: theme.padding.large,
    overflow: "hidden",
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: -16,
        blurRadius: "20px",
      },
    ],
  },
  containerBigInner: {
    padding: theme.padding.medium,
    borderRadius: theme.borderRadius.xlarge,
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
    borderRadius: theme.borderRadius.xlarge,
    marginTop: theme.padding.large,
    overflow: "hidden",
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: -16,
        blurRadius: "20px",
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
