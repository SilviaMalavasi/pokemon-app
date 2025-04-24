import { Image } from "react-native";
import { Colors } from "@/style/base/Colors";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import FullCard from "@/components/FullCard";

export default function FullCardScreen(cardId: string) {
  return (
    <ParallaxScrollView
      headerBackgroundColor={Colors.mediumGrey}
      headerImage={
        <Image
          source={require("@/assets/fondo.png")}
          resizeMode="contain"
        />
      }
      headerTitle="Card Details"
    >
      <ThemedView>
        <FullCard card={cardId} />
      </ThemedView>
    </ParallaxScrollView>
  );
}
