import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
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

export default function FreeSearchScreen() {
  const [resetKey, setResetKey] = useState(0);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const router = useRouter();
  const { setCardIds, setQuery, setCurrentPage, setItemsPerPage, setCards, setLoading } = useSearchResultContext();
  const { setLastSearchPage, lastSearchPage, clearFreeForm } = useSearchFormContext();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  // Handler to receive card IDs from FreeSearch
  const handleSearchResults = async (ids: string[], query: string) => {
    let filteredIds = ids;
    if (removeDuplicates && ids.length > 0) {
      // Fetch card details for duplicate removal
      const { data, error } = await supabase
        .from("Card")
        .select("cardId, name, supertype, hp, rules")
        .in("cardId", ids);
      if (!error && data) {
        const deduped = await removeCardDuplicates(data);
        filteredIds = ids.filter((id) => deduped.some((c) => c.cardId === id));
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
    setLastSearchPage("free"); // Ensure context knows this was a free search
    router.push("/cards/searchresult");
  };

  // Reset the search form when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        // @ts-ignore
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
      if (lastSearchPage !== "free") {
        setResetKey((k) => k + 1);
        clearFreeForm();
        setRemoveDuplicates(false);
      }
      setLastSearchPage("free");
    }, [lastSearchPage])
  );

  React.useEffect(() => {
    if (scrollRef.current) {
      // @ts-ignore
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [resetKey]);

  return (
    <ParallaxScrollView
      headerImage="advanced-search.webp"
      headerTitle="Free Search"
      scrollRef={scrollRef}
    >
      <ThemedView>
        <FreeSearchForm
          key={resetKey}
          onSearchResults={handleSearchResults}
          setLoading={() => {}}
          resetKey={resetKey}
          removeDuplicates={removeDuplicates}
          onRemoveDuplicatesChange={setRemoveDuplicates}
          currentPage={1}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </ThemedView>
      <ThemedModal
        visible={modalVisible}
        buttonType="main"
        buttonSize="small"
        onClose={() => setModalVisible(false)}
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
