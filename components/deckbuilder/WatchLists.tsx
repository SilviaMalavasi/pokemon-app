import React from "react";
import ThemedText from "@/components/base/ThemedText";
import CompactWatchlist from "@/components/deckbuilder/CompactWatchlist";
import ThemedView from "@/components/base/ThemedView";
import { ActivityIndicator, View } from "react-native";
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
  onPressWatchlist?: (id: number) => void; // Add this line
  layout: "view" | "edit";
  style?: any;
}

export default function WatchLists({
  watchLists = [],
  isLoadingWatchLists,
  deletingId,
  layout,
  onDelete,
  onPressWatchlist, // Add this line
  ...props
}: WatchListsSectionProps) {
  return (
    <ThemedView
      {...props}
      style={[
        props.style,
        watchLists.length > 0 && !isLoadingWatchLists
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
          style={{ paddingBottom: theme.padding.medium, paddingLeft: theme.padding.small }}
        >
          Watchlists
        </ThemedText>
      )}
      {isLoadingWatchLists ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ActivityIndicator
            size="large"
            color={theme.colors.purple}
          />
        </View>
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
                onPressWatchlist={onPressWatchlist}
              />
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}
