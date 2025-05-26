import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  tabBarContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 82,
    paddingTop: 8,
    borderTopWidth: 0,
    boxShadow: [
      {
        color: theme.colors.shadowLight,
        offsetX: -2,
        offsetY: -2,
        blurRadius: "4px",
      },
    ],
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
