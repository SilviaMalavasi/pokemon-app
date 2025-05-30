import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import MainScrollView from "@/components/ui/MainScrollView";
import FreeSearchForm from "@/components/forms/FreeSearchForm";
import { useSearchResultContext } from "@/components/context/SearchResultContext";
import ThemedModal from "@/components/base/ThemedModal";
import { SearchFormProvider, useSearchFormContext } from "@/components/context/SearchFormContext";
import { removeCardDuplicates } from "@/helpers/removeCardDuplicates";
import ThemedText from "@/components/base/ThemedText";
import { theme } from "@/style/ui/Theme";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import { CardForDuplicateCheck } from "@/types/PokemonCardType";
import { View } from "react-native";

// Helper function to generate SQL placeholders like ?,?,?
function generatePlaceholders(count: number): string {
  return Array(count).fill("?").join(",");
}

function FreeSearchScreenInner() {
  const { db } = useCardDatabase();
  const [resetKey, setResetKey] = useState(0);
  const [removeDuplicatesState, setRemoveDuplicatesState] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const router = useRouter();
  const { setCardIds, setQuery, setCurrentPage, setItemsPerPage, setCards, setLoading } = useSearchResultContext();
  const { setLastSearchPage, lastSearchPage, clearFreeForm } = useSearchFormContext();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  // Handler to receive card IDs from FreeSearch
  const handleSearchResults = async (ids: string[], query: string) => {
    let filteredIds = ids;
    if (!db) {
      setLoading(false);
      // Optionally show an error to the user
      return;
    }
    if (removeDuplicatesState && ids.length > 0) {
      // Fetch card details for duplicate removal using SQLite
      const placeholders = generatePlaceholders(ids.length);
      const sql = `SELECT cardId, name, supertype, hp, rules FROM Card WHERE cardId IN (${placeholders})`;
      try {
        // Spread the ids array for parameters
        const data = await db.getAllAsync<CardForDuplicateCheck>(sql, [...ids]);
        if (data && data.length > 0) {
          // Pass db and data to removeCardDuplicates
          const deduped = await removeCardDuplicates(db, data);
          filteredIds = deduped.map((c) => c.cardId);
        }
      } catch (error) {
        console.error("Error fetching cards for duplicate check:", error);
        // Proceed with original IDs if fetching fails
      }
    }
    if (filteredIds.length === 0) {
      setModalVisible(true); // Use correct setter
      setLoading(false);
      return;
    }
    setCardIds(filteredIds);
    setQuery(query);
    setCurrentPage(1);
    setItemsPerPage(ITEMS_PER_PAGE);
    setCards([]);
    setLoading(false);
    setLastSearchPage("free");
    router.push("/cards/searchresult");
  };

  // Reset the search form when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (lastSearchPage !== "free") {
        setResetKey((k) => k + 1);
        clearFreeForm();
        setRemoveDuplicatesState(false);
      }
      setLastSearchPage("free");
    }, [lastSearchPage])
  );

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [resetKey]);

  return (
    <MainScrollView
      headerImage="free-search-bkg"
      headerTitle="Free Search"
      scrollRef={scrollRef}
    >
      <View style={{ paddingBottom: theme.padding.large }}>
        <FreeSearchForm
          key={resetKey}
          onSearchResults={handleSearchResults}
          setLoading={setLoading}
          resetKey={resetKey}
          removeDuplicates={removeDuplicatesState}
          onRemoveDuplicatesChange={setRemoveDuplicatesState}
        />
      </View>
      <ThemedModal
        visible={modalVisible}
        buttonType="main"
        buttonSize="small"
        onClose={() => setModalVisible(false)}
        contentStyle={{ width: "85%" }}
      >
        <ThemedText
          type="h4"
          style={{ paddingTop: theme.padding.small, paddingBottom: theme.padding.xsmall }}
        >
          No cards found
        </ThemedText>
      </ThemedModal>
    </MainScrollView>
  );
}

export default function FreeSearchScreen(props: any) {
  return (
    <SearchFormProvider>
      <FreeSearchScreenInner {...props} />
    </SearchFormProvider>
  );
}
