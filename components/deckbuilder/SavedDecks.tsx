import React from "react";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import DeckCompact from "@/components/DeckCompact";
import SearchResultStyle from "@/style/SearchResultStyle";

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
      <ThemedText type="subtitle">Saved Decks</ThemedText>
      {isLoadingDecks ? (
        <ThemedText>Loading decks...</ThemedText>
      ) : savedDecks.length === 0 ? (
        <ThemedText>No saved decks yet.</ThemedText>
      ) : (
        <ThemedView style={SearchResultStyle.cardList}>
          {savedDecks.map((deck, idx) => (
            <ThemedView key={deck.id + "-deck"}>
              <DeckCompact deck={deck} />
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}
