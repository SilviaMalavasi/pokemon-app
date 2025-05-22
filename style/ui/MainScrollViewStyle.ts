import { StyleSheet, Dimensions } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: "100%",
    height: vw(40),
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.darkGrey,
    borderBottomLeftRadius: theme.borderRadius.xlarge,
    borderBottomRightRadius: theme.borderRadius.xlarge,
    overflow: "hidden",
    marginBottom: theme.padding.medium,
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: 8,
        blurRadius: "8px",
      },
    ],
  },
  headerBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
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
    paddingTop: vw(10),
    zIndex: 2,
  },
  headerImageContainer: {
    flexBasis: 100,
    width: 100,
    height: "100%",
    paddingHorizontal: vw(5),
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
    paddingRight: theme.padding.small,
    paddingBottom: 0,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    minHeight: Dimensions.get("window").height - vw(40),
  },
});

export default styles;
