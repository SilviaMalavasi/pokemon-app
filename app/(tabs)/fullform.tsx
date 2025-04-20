import { StyleSheet } from "react-native";
import { Image } from "react-native";

import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import FullForm from "@/components/forms/FullForm";
import { Colors } from "@/style/Colors";

export default function FullFormScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={Colors.mediumGrey}
      headerImage={
        <Image
          source={require("@/assets/images/fondo.png")}
          resizeMode="contain"
        />
      }
      headerTitle="Advanced Search"
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
        <FullForm />
      </ThemedView>
    </ParallaxScrollView>
  );
}
