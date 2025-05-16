import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 200,
    height: 200,
  },
  animatedTextContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 100,
  },
  title: {
    textTransform: "uppercase",
    textAlign: "center",
  },
  text: {
    fontFamily: "Inter-SemiBold",
    fontSize: theme.fontSizes.font18,
    lineHeight: theme.fontSizes.font18 * 1.15,
    color: theme.colors.white,
    textAlign: "center",
    maxWidth: "75%",
  },
  warnigText: {
    paddingTop: theme.padding.medium,
    paddingBottom: theme.padding.xsmall,
    color: theme.colors.white,
    textAlign: "center",
    maxWidth: "75%",
  },
  progressBarContainer: {
    width: 220,
    height: 16,
    backgroundColor: theme.colors.darkGrey,
    borderRadius: theme.borderRadius.small,
    overflow: "hidden",
    marginVertical: theme.padding.large,
    borderWidth: 1,
    borderColor: theme.colors.white,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.purple,
    transitionProperty: "width",
    transitionDuration: "0.3s",
  },
});

export default styles;
