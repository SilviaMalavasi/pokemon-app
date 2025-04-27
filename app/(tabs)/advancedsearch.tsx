import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import AdvancedSearchForm from "@/components/forms/AdvancedSearchForm";
import { useSearchResultContext } from "@/components/context/SearchResultContext";
import ThemedModal from "@/components/base/ThemedModal";
import { useSearchFormContext } from "@/components/context/SearchFormContext";

export default function FullFormScreen() {
  const [resetKey, setResetKey] = useState(0);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const router = useRouter();
  const { setCardIds, setQuery, setCurrentPage, setItemsPerPage, setCards, setLoading } = useSearchResultContext();
  const { setAdvancedForm, setLastSearchType, clearAdvancedForm } = useSearchFormContext();

  // Handler to receive card IDs from AdvancedSearch
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
    if (filteredIds.length === 0) {
      setModalVisible(true);
      setLoading(false);
      return;
    }
    setCardIds(filteredIds);
    setQuery(query);
    setCurrentPage(1);
    setItemsPerPage(ITEMS_PER_PAGE);
    setCards([]);
    setLoading(false);
    setLastSearchType("advanced");
    router.push("/cards/searchresult");
  };

  // Reset the search form when the screen is focused, but only if not coming from searchresult
  useFocusEffect(
    React.useCallback(() => {
      // If not coming from searchresult, reset form
      if (window && window.history && window.history.state && window.history.state.idx === 0) {
        setResetKey((k) => k + 1);
        clearAdvancedForm();
      }
    }, [])
  );

  return (
    <AutocompleteDropdownContextProvider>
      <ParallaxScrollView
        headerImage="advanced-search.webp"
        headerTitle="Advanced Search"
      >
        <ThemedView>
          <AdvancedSearchForm
            onSearchResults={handleSearchResults}
            setLoading={() => {}}
            resetKey={resetKey}
            removeDuplicates={removeDuplicates}
            onRemoveDuplicatesChange={setRemoveDuplicates}
            currentPage={1}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </ThemedView>
        <ThemedModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          message="No cards found"
        />
      </ParallaxScrollView>
    </AutocompleteDropdownContextProvider>
  );
}
