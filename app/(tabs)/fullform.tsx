import React, { useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Image, findNodeHandle, UIManager } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { supabase } from "@/lib/supabase";
import type { CardType } from "@/types/PokemonCardType";

import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import FullForm from "@/components/forms/FullForm";
import { Colors } from "@/style/Colors";
import SearchResult from "@/components/SearchResult";

export default function FullFormScreen() {
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [cards, setCards] = useState<Pick<CardType, "cardId" | "name" | "imagesSmall">[]>([]);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const searchResultRef = useRef<any>(null);

  // Handler to receive card IDs from FullForm
  const handleSearchResults = (ids: string[], query: string) => {
    setCardIds(ids);
    setSearchQuery(query);
    setLoading(false);
    setCurrentPage(1); // Reset to first page on new search
    // Scroll to SearchResult after results are set
    setTimeout(() => {
      const scrollNode = scrollRef.current;
      const searchNode = searchResultRef.current;
      if (searchNode && scrollNode) {
        const searchNativeNode = findNodeHandle(searchNode);
        const scrollNativeNode = findNodeHandle(scrollNode);
        if (searchNativeNode && scrollNativeNode) {
          UIManager.measureLayout(
            searchNativeNode,
            scrollNativeNode,
            () => {},
            (x: number, y: number) => {
              scrollNode.scrollTo({ y, animated: true });
            }
          );
        }
      }
    }, 100);
  };

  // Fetch paginated card data when cardIds or currentPage changes
  React.useEffect(() => {
    const fetchCards = async () => {
      if (!cardIds || cardIds.length === 0) {
        setCards([]);
        return;
      }
      setLoading(true);
      const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
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
  }, [cardIds, currentPage]);

  //Reset the search results when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setCardIds([]);
      setSearchQuery("");
      setLoading(false);
      setResetKey((k) => k + 1);
    }, [])
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={Colors.mediumGrey}
      headerImage={
        <Image
          source={require("@/assets/images/fondo.png")}
          resizeMode="contain"
        />
      }
      headerTitle="Advanced Search"
      scrollRef={scrollRef}
    >
      <ThemedView>
        <FullForm
          onSearchResults={handleSearchResults}
          setLoading={setLoading}
          resetKey={resetKey}
        />
      </ThemedView>
      <ThemedView ref={searchResultRef}>
        <SearchResult
          cardIds={cardIds}
          cards={cards}
          query={searchQuery}
          loading={loading}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}
