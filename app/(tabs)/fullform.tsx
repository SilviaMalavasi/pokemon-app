import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "react-native";

import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import FullForm from "@/components/forms/FullForm";
import { Colors } from "@/style/Colors";
import SearchResult from "@/components/SearchResult";

export default function FullFormScreen() {
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Handler to receive card IDs from FullForm
  const handleSearchResults = (ids: string[], query: string) => {
    setCardIds(ids);
    setSearchQuery(query);
    setLoading(false);
  };

  //Reset the search results when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setCardIds([]);
      setSearchQuery("");
      setLoading(false);
      setResetKey((k) => k + 1);
    }, [])
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={Colors.mediumGrey}
      headerImage={
        <Image
          source={require("@/assets/images/fondo.png")}
          resizeMode="contain"
        />
      }
      headerTitle="Advanced Search"
    >
      <ThemedView>
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 16 }}
        >
          This is a full form example. You can use this to create a full form with multiple fields and validation.
        </ThemedText>
      </ThemedView>
      <ThemedView>
        <FullForm
          onSearchResults={handleSearchResults}
          setLoading={setLoading}
          resetKey={resetKey}
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
