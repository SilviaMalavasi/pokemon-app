import React from "react";
import { View } from "react-native";
import ThemedView from "@/components/ui/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedText from "@/components/base/ThemedText";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import CardAutoCompleteInput, {
  CardAutoCompleteProvider,
  CardAutoCompleteSuggestions,
} from "@/components/base/CardAutoCompleteInput";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";

interface NewDeckSectionProps {
  deckName: string;
  setDeckName: (name: string) => void;
  deckThumbnail: string;
  setDeckThumbnail: (url: string) => void;
  handleSaveDeck: () => void;
  handleThumbnailSelect: (url: string) => void;
  layout?: "titled" | "untitled";
}

export default function NewDeck({
  deckName,
  setDeckName,
  deckThumbnail,
  handleSaveDeck,
  setDeckThumbnail,
  layout = "untitled",
}: NewDeckSectionProps) {
  const isNameMissing = !deckName.trim();
  const isSaveDisabled = isNameMissing;

  const [autoCompleteKey, setAutoCompleteKey] = React.useState(0);
  const { db } = useCardDatabase();

  // Handler to select thumbnail by cardId
  const handleThumbnailSelect = async (cardId: string) => {
    if (!db) return;
    try {
      const card = await db.getFirstAsync<{ imagesLarge: string }>("SELECT imagesLarge FROM Card WHERE cardId = ?", [
        cardId,
      ]);
      if (card && card.imagesLarge) {
        setDeckThumbnail(card.imagesLarge);
      }
    } catch (e) {
      console.error("Error fetching card image for thumbnail:", e);
    }
  };

  const handleSavePress = () => {
    if (isSaveDisabled) return;
    handleSaveDeck();
    setAutoCompleteKey((k) => k + 1); // Reset CardAutoCompleteInput
  };

  return (
    <ThemedView>
      <CardAutoCompleteProvider>
        {layout === "titled" && (
          <>
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
            <ThemedText
              color={theme.colors.grey}
              style={{
                padding: theme.padding.small,
              }}
            >
              No saved decks yet. Add a new deck to get started!
            </ThemedText>
          </>
        )}
        <View style={{ paddingTop: theme.padding.medium, paddingBottom: theme.padding.xlarge }}>
          <ThemedTextInput
            value={deckName}
            onChange={setDeckName}
            placeholder="Enter deck name *"
          />
          {!db ? (
            <ThemedButton
              title="Loading cards..."
              width={vw(64)}
              disabled
              style={{ marginTop: theme.padding.medium }}
            />
          ) : (
            <>
              <CardAutoCompleteInput
                key={autoCompleteKey}
                value={deckThumbnail}
                onCardSelect={handleThumbnailSelect}
                placeholder="Thumbnail card name (min 3 chars)"
                maxChars={25}
                resetKey={autoCompleteKey} // Pass resetKey to force clear
              />
              <CardAutoCompleteSuggestions onCardSelect={handleThumbnailSelect} />
            </>
          )}

          <ThemedButton
            title="Add New Deck"
            width={vw(54)}
            onPress={handleSavePress}
            disabled={isSaveDisabled}
            style={{ marginTop: theme.padding.medium }}
          />
        </View>
      </CardAutoCompleteProvider>
    </ThemedView>
  );
}
