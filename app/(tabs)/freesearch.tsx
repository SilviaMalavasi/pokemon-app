import { StyleSheet } from "react-native";
import { Image } from "react-native";
import React, { useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import type { CardType } from "@/types/PokemonCardType";
import { findNodeHandle, UIManager } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";

import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedText from "@/components/base/ThemedText";
import ThemedView from "@/components/base/ThemedView";
import FreeSearch from "@/components/forms/FreeSearch";
import SearchResult from "@/components/SearchResult";
import { Colors } from "@/style/Colors";

export default function FreeSearchScreen() {
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [cards, setCards] = useState<Pick<CardType, "cardId" | "name" | "imagesSmall">[]>([]);
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const searchResultRef = useRef(null);

  const scrollToSearchResult = () => {
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
            (x, y) => {
              scrollNode.scrollTo({ y: y - 30, animated: true });
            }
          );
        }
      }
    }, 100);
  };

  // Handler to receive card IDs from FreeSearch
  const handleSearchResults = (ids: string[], query: string) => {
    setCardIds(ids);
    setSearchQuery(query);
    setLoading(false);
    setCurrentPage(1);
    scrollToSearchResult();
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

  // Scroll to SearchResult on page change
  React.useEffect(() => {
    if (currentPage !== 1) {
      scrollToSearchResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Reset the search results when the screen is focused
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
      headerTitle="Free Search"
      scrollRef={scrollRef}
    >
      <ThemedView>
        <FreeSearch
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
