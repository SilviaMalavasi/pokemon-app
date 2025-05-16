import React from "react";
import ThemedText from "@/components/base/ThemedText";
import CompactDeck from "@/components/deckbuilder/CompactDeck";
import ThemedView from "@/components/ui/ThemedView";
import NewDeck from "@/components/deckbuilder/NewDeck";
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
  onDelete,
  ...props
}: SavedDecksSectionProps & { style?: any }) {
  return (
    <ThemedView {...props}>
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
        <ThemedText
          color={theme.colors.grey}
          style={{
            padding: theme.padding.small,
          }}
        >
          No saved decks yet. Add a new deck to get started!
        </ThemedText>
      ) : (
        <View style={layout === "edit" ? { paddingTop: theme.padding.medium } : {}}>
          {savedDecks.map((deck) => (
            <View key={deck.id + "-deck"}>
              <CompactDeck
                deck={deck}
                layout={layout}
                loading={deletingId === deck.id}
                onDelete={onDelete}
              />
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}
