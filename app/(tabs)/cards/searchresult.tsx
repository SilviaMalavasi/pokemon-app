import React, { useEffect, useCallback, useRef } from "react";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";
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
  const { lastSearchPage, clearAdvancedForm, fromCardId, setFromCardId } = useSearchFormContext();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const skipNextScroll = useRef(false);
  // Get SQLite DB instance
  const { db } = useCardDatabase();

  useFocusEffect(
    React.useCallback(() => {
      if (fromCardId) {
        setFromCardId(false);
        skipNextScroll.current = true;
        return;
      }
      if (skipNextScroll.current) {
        skipNextScroll.current = false;
        return;
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [cardIds, currentPage, fromCardId, setFromCardId])
  );

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

  // Back button handler
  const handleBack = () => {
    if (loading || !cardIds) {
      // Optionally, show a message or do nothing while loading or cardIds not loaded
      return;
    }
    if (lastSearchPage === "advanced") {
      router.replace("/advancedsearch");
    } else if (lastSearchPage === "free") {
      router.replace("/freesearch");
    } else {
      clearAdvancedForm();
      router.replace("/advancedsearch");
    }
  };

  // Show loading indicator or nothing while loading, or if cardIds is undefined/null
  if (loading || !cardIds) {
    // You can replace this View with a custom loading spinner if desired
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />;
  }

  return (
    <>
      <ParallaxScrollView
        headerImage="search-results-bkg"
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
