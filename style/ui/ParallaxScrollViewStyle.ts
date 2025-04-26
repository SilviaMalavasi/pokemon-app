import { StyleSheet, Dimensions } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    width: "100%",
    height: 160,
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  headerBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
    overflow: "hidden",
  },
  headerBackgroundImage: {
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  headerImageContainer: {
    flexBasis: 110,
    width: 110,
    height: "100%",
    paddingHorizontal: theme.padding.medium,
    paddingTop: theme.padding.xlarge,
  },
  headerImageContainerImage: {
    width: "100%",
    height: "100%",
  },
  headerTitleContainer: {
    flexShrink: 1,
    maxWidth: "100%",
  },
  headerTitle: {
    paddingTop: 42,
    paddingBottom: 0,
  },
  content: {
    flex: 1,
    minHeight: Dimensions.get("window").height - 150,
  },
});

export default styles;
