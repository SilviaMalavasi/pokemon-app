import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import FullForm from "@/components/forms/FullForm";
import { Colors } from "@/style/Colors";

export default function FullFormScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={Colors.background}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView>
        <ThemedText type="title">FullForm</ThemedText>
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 16 }}
        >
          This is a full form example. You can use this to create a full form with multiple fields and validation.
        </ThemedText>
      </ThemedView>
      <ThemedView>
        <FullForm />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
});
