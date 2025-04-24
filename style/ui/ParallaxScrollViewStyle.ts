import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/style/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 185,
    alignItems: "flex-start",
    justifyContent: "center",
    overflow: "hidden",
    display: "flex",
  },
  headerImageCont: {
    width: 110,
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: 110,
  },
  headerTitle: {
    flex: 1,
    paddingLeft: 4,
    paddingRight: 32,
    paddingTop: 20,
    color: Colors.highlight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
    minHeight: Dimensions.get("window").height - 150,
    marginTop: -16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export default styles;
