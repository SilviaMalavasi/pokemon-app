import React from "react";
import ThemedText from "@/components/base/ThemedText";
import CompactDeck from "@/components/deckbuilder/CompactDeck";
import ThemedView from "@/components/ui/ThemedView";
import { ActivityIndicator, View } from "react-native";
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
  onPressDeck?: (id: number) => void; // Add this line
  layout: "view" | "edit";
}

export default function SavedDecks({
  savedDecks,
  isLoadingDecks,
  deletingId,
  layout,
  onDelete,
  onPressDeck, // Add this line
  ...props
}: SavedDecksSectionProps & { style?: any }) {
  return (
    <ThemedView
      {...props}
      style={[
        props.style,
        savedDecks.length > 0 && !isLoadingDecks
          ? {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }
          : null,
      ]}
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ActivityIndicator
            size="large"
            color={theme.colors.purple}
          />
        </View>
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
                onPressDeck={onPressDeck} // Add this line
              />
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}
