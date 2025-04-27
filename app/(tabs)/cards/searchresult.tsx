import React, { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import SearchResult from "@/components/SearchResult";
import { useSearchResultContext } from "@/components/context/SearchResultContext";
import { useRouter } from "expo-router";
import { useSearchFormContext } from "@/components/context/SearchFormContext";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import ThemedText from "@/components/base/ThemedText";

export default function SearchResultScreen() {
  const { cardIds, query, currentPage, itemsPerPage, cards, loading, setCards, setLoading, setCurrentPage } =
    useSearchResultContext();
  const router = useRouter();
  const { lastSearchType, clearAdvancedForm } = useSearchFormContext();

  // Fetch paginated card data when cardIds or currentPage changes
  useEffect(() => {
    const fetchCards = async () => {
      if (!cardIds || cardIds.length === 0) {
        setCards([]);
        return;
      }
      setLoading(true);
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const paginatedIds = cardIds.slice(startIdx, endIdx);
      const { data, error } = await supabase
        .from("Card")
        .select("cardId, name, imagesSmall")
        .in("cardId", paginatedIds);
      if (error) {
        setCards([]);
      } else {
        // Ensure order matches paginatedIds
        const cardsOrdered = paginatedIds.map(
          (id) => data.find((c) => c.cardId === id) || { cardId: id, name: id, imagesSmall: "" }
        );
        setCards(cardsOrdered);
      }
      setLoading(false);
    };
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIds, currentPage, itemsPerPage]);

  // Pagination handler
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const handleAllImagesLoaded = useCallback(() => {}, [cardIds]);

  // Back button handler
  const handleBack = () => {
    if (lastSearchType === "advanced") {
      router.replace("/advancedsearch");
    } else if (lastSearchType === "free") {
      router.replace("/freesearch");
    } else {
      clearAdvancedForm();
      router.replace("/advancedsearch");
    }
  };

  return (
    <ParallaxScrollView
      headerImage="advanced-search.webp"
      headerTitle="Search Results"
    >
      <ThemedView>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <TouchableOpacity
            onPress={handleBack}
            style={{ marginRight: 12 }}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#888"
            />
            <ThemedText>Back to search</ThemedText>
          </TouchableOpacity>
        </View>
        <SearchResult
          cardIds={cardIds}
          cards={cards}
          query={query}
          loading={loading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onAllImagesLoaded={handleAllImagesLoaded}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}
