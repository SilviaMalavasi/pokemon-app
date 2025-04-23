import { Image, StyleSheet, Platform } from "react-native";
import { Colors } from "@/style/Colors";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import { ExternalLink } from "@/components/base/ExternalLink";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={Colors.mediumGrey}
      headerImage={
        <Image
          source={require("@/assets/fondo.png")}
          resizeMode="contain"
        />
      }
      headerTitle="Pokémon Deck Builder"
    >
      <ThemedView>
        <ThemedText
          type="defaultSemiBold"
          style={{ paddingBottom: 12 }}
        >
          This app helps players build their Pokémon decks by searching only for cards in the current rotation.
        </ThemedText>
        <ThemedText type="default">
          Developed by Pokémon nerd and developer{" "}
          <ExternalLink
            href="https://www.linkedin.com/in/silvia-malavasi/"
            style={{ color: Colors.alternativeText }}
          >
            Silvia Malavasi
          </ExternalLink>{" "}
          for the Pokémon TCG community. Credits goes to{" "}
          <ExternalLink
            href="https://pokemontcg.io/"
            style={{ color: Colors.highlight }}
          >
            pokemontcg.io{" "}
          </ExternalLink>
          for the Card Archive.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
