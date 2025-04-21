import { StyleSheet } from "react-native";
import { Image } from "react-native";
import { useState } from "react";

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

  // Handler to receive card IDs from FullForm
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
