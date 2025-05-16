import React from "react";
import ThemedText from "@/components/base/ThemedText";
import CompactWatchlist from "@/components/deckbuilder/CompactWatchlist";
import ThemedView from "@/components/ui/ThemedView";
import { View } from "react-native";
import { theme } from "@/style/ui/Theme";

interface Watchlist {
  id: number;
  name: string;
  thumbnail: string | null;
  cards: string;
}

interface WatchListsSectionProps {
  watchLists: Watchlist[];
  isLoadingWatchLists: boolean;
  deletingId: number | null;
  onDelete?: (id: number) => void;
  layout: "view" | "edit";
  style?: any;
}

export default function WatchLists({
  watchLists = [],
  isLoadingWatchLists,
  deletingId,
  layout,
  onDelete,
  ...props
}: WatchListsSectionProps) {
  return (
    <ThemedView {...props}>
      {layout === "view" && (
        <ThemedText
          type="h2"
          color={theme.colors.white}
          style={{ paddingBottom: theme.padding.medium, paddingLeft: theme.padding.small }}
        >
          Watchlists
        </ThemedText>
      )}
      {isLoadingWatchLists ? (
        <ThemedText>Loading watchlists...</ThemedText>
      ) : watchLists.length === 0 ? (
        <ThemedText
          color={theme.colors.grey}
          style={{ padding: theme.padding.small }}
        >
          No watchlists yet. Create a watchlist to track cards for the next metabreaker!
        </ThemedText>
      ) : (
        <View style={layout === "edit" ? { paddingTop: theme.padding.medium } : {}}>
          {watchLists.map((watchlist) => (
            <View key={watchlist.id + "-watchlist"}>
              <CompactWatchlist
                watchlist={watchlist}
                layout={layout}
                loading={deletingId === watchlist.id}
                onDelete={onDelete}
              />
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}
