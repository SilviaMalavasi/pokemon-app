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
  watchlistName: string;
  setWatchlistName: (name: string) => void;
  watchlistThumbnail: string;
  setWatchlistThumbnail: (url: string) => void;
  handleSaveWatchList: () => void;
  handleThumbnailSelect: (url: string) => void;
  layout?: "titled" | "untitled";
}

export default function NewWatchlist({
  watchlistName,
  setWatchlistName,
  watchlistThumbnail,
  handleSaveWatchList,
  setWatchlistThumbnail,
  layout = "untitled",
}: NewDeckSectionProps) {
  const isNameMissing = !watchlistName.trim();
  const isSaveDisabled = isNameMissing;

  const [autoCompleteKey, setAutoCompleteKey] = React.useState(0);
  const { db, isLoading: cardDbLoading } = useCardDatabase();

  // Handler to select thumbnail by cardId
  const handleThumbnailSelect = async (cardId: string) => {
    if (!db) return;
    try {
      const card = await db.getFirstAsync<{ imagesLarge: string }>("SELECT imagesLarge FROM Card WHERE cardId = ?", [
        cardId,
      ]);
      if (card && card.imagesLarge) {
        setWatchlistThumbnail(card.imagesLarge);
      }
    } catch (e) {
      console.error("Error fetching card image for thumbnail:", e);
    }
  };

  const handleSavePress = () => {
    if (isSaveDisabled) return;
    handleSaveWatchList();
    setAutoCompleteKey((k) => k + 1);
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
              Watchlists
            </ThemedText>
            <ThemedText
              color={theme.colors.grey}
              style={{
                padding: theme.padding.small,
              }}
            >
              No watchlists yet. Create a watchlist to track cards for the next metabreaker!
            </ThemedText>
          </>
        )}
        <View style={{ paddingTop: theme.padding.medium, paddingBottom: theme.padding.xlarge }}>
          <ThemedTextInput
            value={watchlistName}
            onChange={setWatchlistName}
            placeholder="Enter watchlist name *"
          />
          {cardDbLoading || !db ? (
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
                value={watchlistThumbnail}
                onCardSelect={handleThumbnailSelect}
                placeholder="Thumbnail card name (min 3 chars)"
                maxChars={25}
                resetKey={autoCompleteKey}
              />
              <CardAutoCompleteSuggestions onCardSelect={handleThumbnailSelect} />
            </>
          )}
          <ThemedButton
            title="Add New Watchlist"
            width={vw(64)}
            onPress={handleSavePress}
            disabled={isSaveDisabled || cardDbLoading || !db}
            style={{ marginTop: theme.padding.medium }}
          />
        </View>
      </CardAutoCompleteProvider>
    </ThemedView>
  );
}
