import React from "react";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import CompactDeck from "@/components/deckbuilder/CompactDeck";
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
  onDelete: (id: number) => void;
  deletingId: number | null;
}

export default function SavedDecks({ savedDecks, isLoadingDecks, onDelete, deletingId }: SavedDecksSectionProps) {
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
          {savedDecks.map((deck) => (
            <ThemedView key={deck.id + "-deck"}>
              <CompactDeck
                deck={deck}
                loading={deletingId === deck.id}
                onDelete={onDelete}
              />
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}
