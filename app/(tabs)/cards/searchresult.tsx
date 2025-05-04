import React, { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import SearchResult from "@/components/SearchResult";
import { useSearchResultContext } from "@/components/context/SearchResultContext";
import { useRouter } from "expo-router";
import { useSearchFormContext } from "@/components/context/SearchFormContext";
import { View } from "react-native";
import FloatingButton from "@/components/ui/FloatingButton";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchResultScreen() {
  const { cardIds, query, currentPage, itemsPerPage, cards, loading, setCards, setLoading, setCurrentPage } =
    useSearchResultContext();
  const router = useRouter();
  const { lastSearchPage, clearAdvancedForm } = useSearchFormContext();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [cardIds, currentPage])
  );

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
        .select("cardId, name, imagesLarge")
        .in("cardId", paginatedIds);
      if (error) {
        setCards([]);
      } else {
        // Ensure order matches paginatedIds
        const cardsOrdered = paginatedIds.map(
          (id) => data.find((c) => c.cardId === id) || { cardId: id, name: id, imagesLarge: "" }
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
    if (lastSearchPage === "advanced") {
      router.replace("/advancedsearch");
    } else if (lastSearchPage === "free") {
      router.replace("/freesearch");
    } else {
      clearAdvancedForm();
      router.replace("/advancedsearch");
    }
  };

  return (
    <>
      <ParallaxScrollView
        headerImage="advanced-search.webp"
        headerTitle="Search Results"
        scrollRef={scrollRef}
      >
        <ThemedView>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}></View>
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
      <SafeAreaView
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          paddingBottom: 16,
          zIndex: 100,
        }}
      >
        <FloatingButton
          title="Back to search"
          onPress={handleBack}
        />
      </SafeAreaView>
    </>
  );
}
