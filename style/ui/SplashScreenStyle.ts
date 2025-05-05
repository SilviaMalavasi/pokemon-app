import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 200,
    height: 200,
  },
  animatedTextContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 100,
  },
  title: {
    textTransform: "uppercase",
    textAlign: "center",
  },
  text: {
    fontFamily: "Inter-SemiBold",
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.15,
    color: theme.colors.text,
    textAlign: "center",
    maxWidth: "70%",
  },
});

export default styles;
