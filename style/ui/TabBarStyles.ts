import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 76,
    backgroundColor: theme.colors.black,
    borderTopWidth: 0,
  },
  tab: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 25,
    height: 25,
  },
  label: {
    paddingTop: 4,
    textAlign: "center",
  },
});

export default styles;
