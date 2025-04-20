import { StyleSheet } from "react-native";
import { Image } from "react-native";

import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import FreeSearch from "@/components/forms/FreeSearch";
import { Colors } from "@/style/Colors";

export default function FreeSearchScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={Colors.mediumGrey}
      headerImage={
        <Image
          source={require("@/assets/images/fondo.png")}
          resizeMode="contain"
        />
      }
      headerTitle="Free Search"
    >
      <ThemedView>
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 16 }}
        >
          This is a full form example. You can use this to create a full form with multiple fields and validation.
        </ThemedText>
      </ThemedView>
      <ThemedView>
        <FreeSearch />
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
