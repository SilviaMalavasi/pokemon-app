import React, { useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Image, findNodeHandle, UIManager } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { supabase } from "@/lib/supabase";
import type { CardType } from "@/types/PokemonCardType";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";
import ThemedView from "@/components/base/ThemedView";
import AdvancedSearchForm from "@/components/forms/AdvancedSearchForm";
import { Colors } from "@/style/base/Colors";
import SearchResult from "@/components/SearchResult";

export default function FullFormScreen() {
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [cards, setCards] = useState<Pick<CardType, "cardId" | "name" | "imagesSmall">[]>([]);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const searchResultRef = useRef<any>(null);

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
            (x: number, y: number) => {
              scrollNode.scrollTo({ y: y - 40, animated: true });
            }
          );
        }
      }
    }, 100);
  };

  // Handler to receive card IDs from FullForm
  const handleSearchResults = async (ids: string[], query: string) => {
    let filteredIds = ids;
    if (removeDuplicates && ids.length > 0) {
      // Fetch card details for duplicate removal
      const { data, error } = await supabase
        .from("Card")
        .select("cardId, name, supertype, setId, rules")
        .in("cardId", ids);
      if (!error && data) {
        const seen = new Set();
        filteredIds = [];
        for (const card of data) {
          let key = "";
          if (card.supertype === "Pokémon") {
            key = `${card.name}|${card.setId}`;
          } else if (card.supertype === "Trainer") {
            key = `${card.name}|${card.rules}`;
          } else {
            key = card.cardId;
          }
          if (!seen.has(key)) {
            seen.add(key);
            filteredIds.push(card.cardId);
          }
        }
        // Preserve original order
        filteredIds = ids.filter((id) => filteredIds.includes(id));
      }
    }
    setCardIds(filteredIds);
    setSearchQuery(query);
    setLoading(false);
    setCurrentPage(1); // Reset to first page on new search
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

  // Scroll only after all images are loaded
  const handleAllImagesLoaded = React.useCallback(() => {
    if (cardIds.length > 0) {
      scrollToSearchResult();
    }
  }, [cardIds]);

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
    <AutocompleteDropdownContextProvider>
      <ParallaxScrollView
        headerBackgroundColor={Colors.mediumGrey}
        headerImage={
          <Image
            source={require("@/assets/fondo.png")}
            resizeMode="contain"
          />
        }
        headerTitle="Advanced Search"
        scrollRef={scrollRef}
      >
        <ThemedView>
          <AdvancedSearchForm
            onSearchResults={handleSearchResults}
            setLoading={setLoading}
            resetKey={resetKey}
            removeDuplicates={removeDuplicates}
            onRemoveDuplicatesChange={setRemoveDuplicates}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
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
            onAllImagesLoaded={handleAllImagesLoaded}
          />
        </ThemedView>
      </ParallaxScrollView>
    </AutocompleteDropdownContextProvider>
  );
}
