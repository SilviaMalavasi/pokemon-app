import { StyleSheet } from "react-native";
import { Colors } from "@/style/base/Colors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  bordered: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.purple,
    borderRadius: 8,
    padding: 8,
  },
});

export default styles;
