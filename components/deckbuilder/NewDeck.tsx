import React from "react";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import CardAutoCompleteInput from "@/components/base/CardAutoCompleteInput";
import { Image } from "react-native";

interface NewDeckSectionProps {
  deckName: string;
  setDeckName: (name: string) => void;
  deckThumbnail: string;
  setDeckThumbnail: (url: string) => void;
  handleSaveDeck: () => void;
  handleThumbnailSelect: (url: string) => void;
}

export default function NewDeck({
  deckName,
  setDeckName,
  deckThumbnail,
  handleSaveDeck,
  handleThumbnailSelect,
}: NewDeckSectionProps) {
  return (
    <ThemedView>
      <ThemedText type="subtitle">New Deck</ThemedText>
      <ThemedTextInput
        label="Deck Name"
        value={deckName}
        onChange={setDeckName}
        placeholder="Enter deck name"
      />
      <CardAutoCompleteInput
        label="Deck Thumbnail"
        value={deckThumbnail}
        onCardSelect={handleThumbnailSelect}
        placeholder="Type card name (min 3 chars)"
        labelHint="Select a card image for the deck"
      />
      {deckThumbnail ? (
        <ThemedView>
          <Image source={{ uri: deckThumbnail }} />
        </ThemedView>
      ) : (
        <ThemedText>No thumbnail selected.</ThemedText>
      )}
      <ThemedButton
        title="Save Deck"
        onPress={handleSaveDeck}
      />
    </ThemedView>
  );
}
