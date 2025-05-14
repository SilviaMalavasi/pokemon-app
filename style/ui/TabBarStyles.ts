import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  tabBarContainer: {
    height: 64,
  },
  icon: {
    width: 25,
    height: 25,
  },
  iconContainer: {
    width: 100,
    height: 60,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: theme.padding.small,
  },
  label: {
    fontSize: theme.fontSizes.font14,
    lineHeight: theme.fontSizes.font14,
    paddingTop: 4,
    textAlign: "center",
  },
});

export default styles;
