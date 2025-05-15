import { StyleSheet, Dimensions } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkGrey,
  },
  header: {
    width: "100%",
    height: 150,
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.darkGrey,
  },
  headerInnerShadow: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    zIndex: 2,
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
  },
  headerBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    borderBottomLeftRadius: theme.borderRadius.xlarge,
    borderBottomRightRadius: theme.borderRadius.xlarge,
    overflow: "hidden",
    boxShadow: [
      {
        color: theme.colors.darkGrey,
        offsetX: 0,
        offsetY: 12,
        blurRadius: "12px",
      },
    ],
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
    flexBasis: 100,
    width: 100,
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
    paddingRight: theme.padding.small,
    paddingBottom: 0,
  },
  content: {
    flex: 1,
    minHeight: Dimensions.get("window").height - 150,
  },
});

export default styles;
