import React from "react";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import CompactDeck from "@/components/CompactDeck";
import SearchResultStyle from "@/style/SearchResultStyle";
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
}

export default function SavedDecks({ savedDecks, isLoadingDecks }: SavedDecksSectionProps) {
  return (
    <ThemedView>
      <ThemedText
        type="subtitle"
        style={{ paddingBottom: theme.padding.medium }}
      >
        Saved Decks
      </ThemedText>
      {isLoadingDecks ? (
        <ThemedText>Loading decks...</ThemedText>
      ) : savedDecks.length === 0 ? (
        <ThemedText>No saved decks yet.</ThemedText>
      ) : (
        <ThemedView style={SearchResultStyle.cardList}>
          {savedDecks.map((deck, idx) => (
            <ThemedView key={deck.id + "-deck"}>
              <CompactDeck deck={deck} />
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}
