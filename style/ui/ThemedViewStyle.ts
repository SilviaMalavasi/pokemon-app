import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xlarge,
    overflow: "hidden",
  },
  containerInner: {
    padding: theme.padding.medium,
    boxShadow: "0px -20px 60px rgba(0,0,0,0.25)",
  },
});

export default styles;
