import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xlarge,
    overflow: "hidden",
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: -16,
        blurRadius: "24px",
      },
    ],
  },
  containerInner: {
    padding: theme.padding.medium,
    borderRadius: theme.borderRadius.xlarge,
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: -16,
        blurRadius: "24px",
      },
      {
        offsetX: 1,
        offsetY: 2,
        blurRadius: "2px",
        color: theme.colors.shadowInsetLight,
        inset: true,
      },
    ],
  },
});

export default styles;
