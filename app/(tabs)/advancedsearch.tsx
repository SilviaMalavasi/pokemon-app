import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import MainScrollView from "@/components/ui/MainScrollView";
import AdvancedSearchForm from "@/components/forms/AdvancedSearchForm";
import { useSearchResultContext } from "@/components/context/SearchResultContext";
import ThemedModal from "@/components/base/ThemedModal";
import { View } from "react-native";
import { SearchFormProvider, useSearchFormContext } from "@/components/context/SearchFormContext";
import { removeCardDuplicates } from "@/helpers/removeCardDuplicates";
import ThemedText from "@/components/base/ThemedText";
import { theme } from "@/style/ui/Theme";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";

function FullFormScreenInner() {
  const [resetKey, setResetKey] = useState(0);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const router = useRouter();
  const { setCardIds, setQuery, setCurrentPage, setItemsPerPage, setCards, setLoading } = useSearchResultContext();
  const { setLastSearchPage, clearAdvancedForm, lastSearchPage } = useSearchFormContext();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { db } = useCardDatabase();

  // Handler to receive card IDs from AdvancedSearch
  const handleSearchResults = async (ids: string[], query: string) => {
    let filteredIds = ids;
    if (!db) {
      setLoading(false);
      // Optionally show an error to the user
      return;
    }
    if (removeDuplicates && ids.length > 0) {
      // Fetch card details for duplicate removal using SQLite
      try {
        const placeholders = ids.map(() => "?").join(", ");
        const data = await db.getAllAsync<{
          cardId: string;
          name: string;
          supertype: string;
          hp: number | null;
          rules: string | null;
        }>(`SELECT cardId, name, supertype, hp, rules FROM Card WHERE cardId IN (${placeholders})`, ids);

        if (data && data.length > 0) {
          const deduped = await removeCardDuplicates(db, data); // Pass db instance
          filteredIds = deduped.map((c) => c.cardId);
        } else {
          // Handle case where no data is found for the IDs, though this shouldn't happen if queryBuilder returned them
          console.warn("No card details found in SQLite for the provided IDs.");
        }
      } catch (error) {
        console.error("Error fetching card details from SQLite:", error);
        // Optionally handle the error, e.g., show a message to the user
        setLoading(false); // Ensure loading state is reset on error
        return; // Stop execution if fetching details fails
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
      if (lastSearchPage !== "advanced") {
        setResetKey((k) => k + 1);
        clearAdvancedForm();
        setRemoveDuplicates(false);
      }
      setLastSearchPage("advanced");
    }, [lastSearchPage])
  );

  return (
    <AutocompleteDropdownContextProvider>
      <MainScrollView
        headerImage="advanced-search-bkg"
        headerTitle="Advanced Search"
        scrollRef={scrollRef}
      >
        <View style={{ paddingBottom: theme.padding.large }}>
          <AdvancedSearchForm
            onSearchResults={handleSearchResults}
            setLoading={setLoading}
            resetKey={resetKey}
            removeDuplicates={removeDuplicates}
            onRemoveDuplicatesChange={setRemoveDuplicates}
            currentPage={1}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </View>
        <ThemedModal
          visible={modalVisible}
          buttonType="main"
          buttonSize="large"
          onClose={() => setModalVisible(false)}
          contentStyle={{ width: "85%" }}
        >
          <ThemedText
            type="h4"
            style={{ paddingTop: theme.padding.small, paddingBottom: theme.padding.small }}
          >
            No cards found
          </ThemedText>
        </ThemedModal>
      </MainScrollView>
    </AutocompleteDropdownContextProvider>
  );
}

export default function FullFormScreen(props: any) {
  return (
    <SearchFormProvider>
      <FullFormScreenInner {...props} />
    </SearchFormProvider>
  );
}
