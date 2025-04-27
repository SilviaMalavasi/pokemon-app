import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import FreeSearchForm from "@/components/forms/FreeSearchForm";
import { useSearchResultContext } from "@/components/context/SearchResultContext";

export default function FreeSearchScreen() {
  const [resetKey, setResetKey] = useState(0);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const router = useRouter();
  const { setCardIds, setQuery, setCurrentPage, setItemsPerPage, setCards, setLoading } = useSearchResultContext();

  // Handler to receive card IDs from FreeSearch
  const handleSearchResults = async (ids: string[], query: string) => {
    let filteredIds = ids;
    if (removeDuplicates && ids.length > 0) {
      // Fetch card details for duplicate removal
      const { data, error } = await supabase
        .from("Card")
        .select("cardId, name, supertype, setId, rules")
        .in("cardId", ids);
      if (!error && data) {
        const seen = new Set();
        filteredIds = [];
        for (const card of data) {
          let key = "";
          if (card.supertype === "Pokémon") {
            key = `${card.name}|${card.setId}`;
          } else if (card.supertype === "Trainer") {
            key = `${card.name}|${card.rules}`;
          } else {
            key = card.cardId;
          }
          if (!seen.has(key)) {
            seen.add(key);
            filteredIds.push(card.cardId);
          }
        }
        // Preserve original order
        filteredIds = ids.filter((id) => filteredIds.includes(id));
      }
    }
    setCardIds(filteredIds);
    setQuery(query);
    setCurrentPage(1);
    setItemsPerPage(ITEMS_PER_PAGE);
    setCards([]);
    setLoading(false);
    router.push("/cards/searchresult");
  };

  // Reset the search form when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setResetKey((k) => k + 1);
    }, [])
  );

  return (
    <ParallaxScrollView
      headerImage="advanced-search.webp"
      headerTitle="Free Search"
    >
      <ThemedView>
        <FreeSearchForm
          key={resetKey}
          onSearchResults={handleSearchResults}
          setLoading={() => {}}
          resetKey={resetKey}
          removeDuplicates={removeDuplicates}
          onRemoveDuplicatesChange={setRemoveDuplicates}
          currentPage={1}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}
