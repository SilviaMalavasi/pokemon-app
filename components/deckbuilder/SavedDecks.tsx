import React from "react";
import ThemedText from "@/components/base/ThemedText";
import CompactDeck from "@/components/deckbuilder/CompactDeck";
import SearchResultStyle from "@/style/SearchResultStyle";
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
}

export default function SavedDecks({ savedDecks, isLoadingDecks, deletingId }: SavedDecksSectionProps) {
  return (
    <ThemedView>
      <ThemedText
        type="h2"
        style={{ paddingBottom: theme.padding.medium }}
      >
        Decks
      </ThemedText>
      {isLoadingDecks ? (
        <ThemedText>Loading decks...</ThemedText>
      ) : savedDecks.length === 0 ? (
        <ThemedText>No saved decks yet.</ThemedText>
      ) : (
        <View style={SearchResultStyle.cardList}>
          {savedDecks.map((deck) => (
            <View key={deck.id + "-deck"}>
              <CompactDeck
                deck={deck}
                loading={deletingId === deck.id}
              />
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}
