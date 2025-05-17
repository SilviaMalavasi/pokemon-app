import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.padding.large * -1.5,
  },
  title: {
    paddingTop: theme.padding.xsmall,
    paddingBottom: theme.padding.medium,
  },
  cardInput: {
    marginBottom: theme.padding.xlarge,
  },
});

export default styles;
