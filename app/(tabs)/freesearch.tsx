import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import FreeSearchForm from "@/components/forms/FreeSearchForm";
import { useSearchResultContext } from "@/components/context/SearchResultContext";
import ThemedModal from "@/components/base/ThemedModal";
import { useSearchFormContext } from "@/components/context/SearchFormContext";
import { removeCardDuplicates } from "@/helpers/removeCardDuplicates";
import ThemedText from "@/components/base/ThemedText";
import { theme } from "@/style/ui/Theme";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import { CardForDuplicateCheck } from "@/types/PokemonCardType";

// Helper function to generate SQL placeholders like ?,?,?
function generatePlaceholders(count: number): string {
  return Array(count).fill("?").join(",");
}

export default function FreeSearchScreen() {
  const { db } = useCardDatabase();
  const [resetKey, setResetKey] = useState(0);
  const [removeDuplicatesState, setRemoveDuplicatesState] = useState(false); // Renamed state variable
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
      // Use renamed state variable
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
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      if (lastSearchPage !== "free") {
        setResetKey((k) => k + 1);
        clearFreeForm();
        setRemoveDuplicatesState(false); // Use renamed state setter
      }
      setLastSearchPage("free");
    }, [lastSearchPage]) // Added missing dependency
  );

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [resetKey]);

  return (
    <ParallaxScrollView
      headerImage="free-search-bkg"
      headerTitle="Free Search"
      scrollRef={scrollRef}
    >
      <ThemedView>
        <FreeSearchForm
          key={resetKey}
          onSearchResults={handleSearchResults}
          setLoading={() => {}}
          resetKey={resetKey}
          removeDuplicates={removeDuplicatesState} // Pass renamed state variable
          onRemoveDuplicatesChange={setRemoveDuplicatesState} // Pass renamed state setter
        />
      </ThemedView>
      <ThemedModal
        visible={modalVisible} // Add missing visible prop
        buttonType="main"
        buttonSize="small"
        onClose={() => setModalVisible(false)} // Use correct setter
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
  );
}
