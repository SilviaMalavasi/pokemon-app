import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
    elevation: 10,
    shadowColor: Colors.highlight,
    minHeight: 600,
  },
});

export default styles;
