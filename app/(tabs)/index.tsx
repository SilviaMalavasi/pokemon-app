import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import ExternalLink from "@/components/base/ExternalLink";
import ThemedButton from "@/components/base/ThemedButton";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

export default function HomeScreen() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        // @ts-ignore
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [])
  );
  return (
    <ParallaxScrollView
      headerImage="advanced-search.webp"
      headerTitle="Pokémon Deck Builder"
      scrollRef={scrollRef}
    >
      <ThemedView>
        <ThemedText
          type="defaultSemiBold"
          style={{ paddingBottom: 12 }}
        >
          This app helps players build their Pokémon decks by searching only for cards in the current rotation. LAST
          UPDATE: 24-04-2025.
        </ThemedText>
        <ThemedText
          type="default"
          style={{ paddingBottom: 12 }}
        >
          This app was created with ♥ by Pokémon nerd and developer{" "}
          <ExternalLink
            color="alternative"
            href="https://www.linkedin.com/in/silvia-malavasi/"
          >
            Silvia Malavasi
          </ExternalLink>{" "}
          for the Pokémon TCG community. Credits goes to{" "}
          <ExternalLink href="https://pokemontcg.io/">pokemontcg.io </ExternalLink>
          for the Card Archive.
        </ThemedText>
        <ThemedText type="hintText">
          This app is not produced, endorsed, supported, or affiliated with Nintendo or The Pokémon Company.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}
