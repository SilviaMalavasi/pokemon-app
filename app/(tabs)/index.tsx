import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import ExternalLink from "@/components/base/ExternalLink";
import ThemedButton from "@/components/base/ThemedButton";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerImage="advanced-search.webp"
      headerTitle="Pokémon Deck Builder"
    >
      <ThemedView>
        <ThemedText
          type="defaultSemiBold"
          style={{ paddingBottom: 12 }}
        >
          This app helps players build their Pokémon decks by searching only for cards in the current rotation. LAST
          UPDATE: 24-04-2025.
        </ThemedText>
        <ThemedView>
          <ThemedButton
            type="main"
            size="large"
            disabled={false}
            icon="search"
            status="active"
            title="Start building your deck"
            onPress={() => {
              console.log("Button pressed!");
            }}
          />
        </ThemedView>
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
