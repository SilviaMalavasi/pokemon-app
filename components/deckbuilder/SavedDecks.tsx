import React from "react";
import ThemedText from "@/components/base/ThemedText";
import CompactDeck from "@/components/deckbuilder/CompactDeck";
import ThemedView from "@/components/ui/ThemedView";
import { View } from "react-native";
import { theme } from "@/style/ui/Theme";

interface SavedDeck {
  id: number;
  name: string;
  thumbnail: string | null;
  cards: string;
}

interface SavedDecksSectionProps {
  savedDecks: SavedDeck[];
  isLoadingDecks: boolean;
  deletingId: number | null;
  onDelete?: (id: number) => void;
  layout: "view" | "edit";
}

export default function SavedDecks({
  savedDecks,
  isLoadingDecks,
  deletingId,
  layout,
  ...props
}: SavedDecksSectionProps & { style?: any }) {
  return (
    <ThemedView
      layout="big"
      {...props}
    >
      {layout === "view" && (
        <ThemedText
          type="h2"
          color={theme.colors.white}
          style={{
            paddingBottom: theme.padding.medium,
            paddingLeft: theme.padding.small,
          }}
        >
          Decks
        </ThemedText>
      )}
      {isLoadingDecks ? (
        <ThemedText>Loading decks...</ThemedText>
      ) : savedDecks.length === 0 ? (
        <ThemedText>No saved decks yet.</ThemedText>
      ) : (
        <View style={layout === "edit" ? { paddingTop: theme.padding.medium } : {}}>
          {savedDecks.map((deck) => (
            <View key={deck.id + "-deck"}>
              <CompactDeck
                deck={deck}
                layout={layout}
                loading={deletingId === deck.id}
              />
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}
