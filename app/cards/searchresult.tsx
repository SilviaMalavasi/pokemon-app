import React, { useEffect, useCallback, useRef } from "react";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
import MainScrollView from "@/components/ui/MainScrollView";
import SearchResult from "@/components/SearchResult";
import { useSearchResultContext } from "@/components/context/SearchResultContext";
import { View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";

export default function SearchResultScreen() {
  const {
    cardIds,
    query,
    currentPage,
    itemsPerPage,
    cards,
    loading,
    setCards,
    setLoading,
    setCurrentPage,
    preventScrollToTop,
    setPreventScrollToTop,
  } = useSearchResultContext();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { db } = useCardDatabase();

  // Fetch paginated card data when cardIds or currentPage changes
  useEffect(() => {
    const fetchCards = async () => {
      if (!db) {
        console.error("Database context not available!");
        setCards([]);
        setLoading(false);
        return;
      }
      if (!cardIds || cardIds.length === 0) {
        setCards([]);
        return;
      }
      setLoading(true);
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const paginatedIds = cardIds.slice(startIdx, endIdx);

      if (paginatedIds.length === 0) {
        setCards([]);
        setLoading(false);
        return;
      }

      try {
        // Use SQLite db instance to fetch names and images
        const placeholders = paginatedIds.map(() => "?").join(", ");
        const data = await db.getAllAsync<{ cardId: string; name: string; imagesLarge: string }>(
          `SELECT cardId, name, imagesLarge FROM Card WHERE cardId IN (${placeholders})`,
          paginatedIds
        );

        // Ensure order matches paginatedIds
        const cardsOrdered = paginatedIds.map(
          (id) => data.find((c) => c.cardId === id) || { cardId: id, name: id, imagesLarge: "" }
        );
        setCards(cardsOrdered);
      } catch (error) {
        console.error("Error fetching cards from SQLite:", error);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [cardIds, currentPage, itemsPerPage, db, setCards, setLoading]); //

  // Pagination handler
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const handleAllImagesLoaded = useCallback(() => {}, [cardIds]);

  // Show loading indicator or nothing while loading, or if cardIds is undefined/null
  if (loading || !cardIds) {
    // You can replace this View with a custom loading spinner if desired
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />;
  }

  return (
    <>
      <MainScrollView
        headerImage="card-bkg"
        headerTitle="Search Results"
        scrollRef={scrollRef}
      >
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}></View>
          <SearchResult
            cardIds={cardIds}
            cards={cards}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onAllImagesLoaded={handleAllImagesLoaded}
          />
        </View>
      </MainScrollView>
    </>
  );
}
