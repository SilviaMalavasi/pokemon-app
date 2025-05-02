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
import { removeCardDuplicates } from "@/helpers/removeCardDuplicates";
import ThemedText from "@/components/base/ThemedText";
import { theme } from "@/style/ui/Theme";
import Animated, { useAnimatedRef } from "react-native-reanimated";

export default function FullFormScreen() {
  const [resetKey, setResetKey] = useState(0);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const router = useRouter();
  const { setCardIds, setQuery, setCurrentPage, setItemsPerPage, setCards, setLoading } = useSearchResultContext();
  const { setAdvancedForm, setLastSearchPage, clearAdvancedForm, lastSearchPage } = useSearchFormContext();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  // Handler to receive card IDs from AdvancedSearch
  const handleSearchResults = async (ids: string[], query: string) => {
    let filteredIds = ids;
    if (removeDuplicates && ids.length > 0) {
      // Fetch card details for duplicate removal
      const { data, error } = await supabase
        .from("Card")
        .select("cardId, name, supertype, hp, rules")
        .in("cardId", ids);
      if (!error && data) {
        const deduped = await removeCardDuplicates(data);
        filteredIds = ids.filter((id) => deduped.some((c) => c.cardId === id));
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
    setLastSearchPage("advanced");
    router.push("/cards/searchresult");
  };

  // Reset the search form when the screen is focused, but only if not coming from searchresult
  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        // @ts-ignore
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      if (lastSearchPage !== "advanced") {
        setResetKey((k) => k + 1);
        clearAdvancedForm();
        setRemoveDuplicates(false);
      }
      setLastSearchPage("advanced");
    }, [lastSearchPage])
  );

  React.useEffect(() => {
    if (scrollRef.current) {
      // @ts-ignore
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [resetKey]);

  return (
    <AutocompleteDropdownContextProvider>
      <ParallaxScrollView
        headerImage="advanced-search.webp"
        headerTitle="Advanced Search"
        scrollRef={scrollRef}
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
          buttonType="main"
          buttonSize="small"
          onClose={() => setModalVisible(false)}
          contentStyle={{ width: "85%" }}
        >
          <ThemedText
            type="defaultSemiBold"
            style={{ paddingTop: theme.padding.small, paddingBottom: theme.padding.xsmall }}
          >
            No cards found
          </ThemedText>
        </ThemedModal>
      </ParallaxScrollView>
    </AutocompleteDropdownContextProvider>
  );
}
