import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  default: {
    backgroundColor: Colors.highlight,
    color: Colors.text,
  },
  alternative: {
    backgroundColor: Colors.alternativeText,
    color: Colors.text,
  },
  disabled: {
    backgroundColor: Colors.lightBackground,
    color: Colors.text,
  },
});

export default styles;
