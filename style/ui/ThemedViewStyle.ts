import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: theme.borderRadius.xlarge,
    borderTopRightRadius: theme.borderRadius.xlarge,
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
  containerInner: {
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
});

export default styles;
