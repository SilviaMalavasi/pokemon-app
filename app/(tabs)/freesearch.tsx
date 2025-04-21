import { StyleSheet } from "react-native";
import { Image } from "react-native";
import React, { useState } from "react";

import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import FreeSearch from "@/components/forms/FreeSearch";
import SearchResult from "@/components/SearchResult";
import { Colors } from "@/style/Colors";

export default function FreeSearchScreen() {
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Handler to receive card IDs from FreeSearch
  const handleSearchResults = (ids: string[], query: string) => {
    setCardIds(ids);
    setSearchQuery(query);
    setLoading(false);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={Colors.mediumGrey}
      headerImage={
        <Image
          source={require("@/assets/images/fondo.png")}
          resizeMode="contain"
        />
      }
      headerTitle="Free Search"
    >
      <ThemedView>
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 16 }}
        >
          Search a card by any text. You can exclude fields from the search.
        </ThemedText>
      </ThemedView>
      <ThemedView>
        <FreeSearch
          onSearchResults={handleSearchResults}
          setLoading={setLoading}
        />
      </ThemedView>
      <ThemedView>
        <SearchResult
          cardIds={cardIds}
          query={searchQuery}
          loading={loading}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}
