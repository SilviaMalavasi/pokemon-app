import React from "react";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import CardAutoCompleteInput from "@/components/base/CardAutoCompleteInput";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";

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
  const isNameMissing = !deckName.trim();
  const isSaveDisabled = isNameMissing;

  const [autoCompleteKey, setAutoCompleteKey] = React.useState(0);

  const handleSavePress = () => {
    if (isSaveDisabled) return;
    handleSaveDeck();
    setAutoCompleteKey((k) => k + 1); // Reset CardAutoCompleteInput
  };

  return (
    <ThemedView>
      <ThemedText type="subtitle">New Deck</ThemedText>
      <ThemedView style={{ paddingTop: theme.padding.medium, paddingBottom: theme.padding.xlarge }}>
        <ThemedTextInput
          label="Deck Name *"
          value={deckName}
          onChange={setDeckName}
          placeholder="Enter deck name"
        />
        <CardAutoCompleteInput
          key={autoCompleteKey}
          label="Deck Thumbnail"
          value={deckThumbnail}
          onCardSelect={handleThumbnailSelect}
          placeholder="Type card name (min 3 chars)"
          labelHint="Select a card image for the deck"
        />
        <ThemedButton
          title="Save Deck"
          width={vw(40)}
          onPress={handleSavePress}
          disabled={isSaveDisabled}
          style={{ marginTop: theme.padding.small }}
        />
      </ThemedView>
    </ThemedView>
  );
}
