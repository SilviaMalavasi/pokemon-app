import { StyleSheet } from "react-native";
import { Colors } from "@/style/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 150,
    alignItems: "flex-start",
    justifyContent: "center",
    overflow: "hidden",
    display: "flex",
  },
  headerImageCont: {
    width: "100%",
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: 120,
  },
  headerTitle: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 32,
    paddingTop: 32,
    color: Colors.highlight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
    elevation: 10,
    shadowColor: Colors.highlight,
    minHeight: 600,
    marginTop: -12,
  },
});

export default styles;
