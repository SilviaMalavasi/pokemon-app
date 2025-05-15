import { StyleSheet, Dimensions } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: "100%",
    height: 130,
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.darkGrey,
    borderBottomLeftRadius: theme.borderRadius.xlarge,
    borderBottomRightRadius: theme.borderRadius.xlarge,
    overflow: "hidden",
    marginBottom: theme.padding.large,
    boxShadow: [
      {
        color: theme.colors.shadowDark,
        offsetX: 0,
        offsetY: 16,
        blurRadius: "20px",
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
    paddingTop: theme.padding.large,

    zIndex: 2,
    boxShadow: [
      {
        offsetX: 4,
        offsetY: 15,
        blurRadius: "24px",
        color: theme.colors.shadowDark,
        inset: true,
      },
    ],
  },
  headerImageContainer: {
    flexBasis: 100,
    width: 100,
    height: "100%",
    paddingHorizontal: 26,
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

    minHeight: Dimensions.get("window").height - 150,
  },
});

export default styles;
