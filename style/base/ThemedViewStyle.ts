import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  bordered: {
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: Colors.purple,
    borderRadius: 16,
    padding: 8,
  },
});

export default styles;
