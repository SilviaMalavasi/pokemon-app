import React from "react";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import CompactCard from "@/components/CompactCard";
import { CardType } from "@/types/PokemonCardType";
import ThemedView from "@/components/base/ThemedView";
import styles from "@/style/SearchResultStyle";
import { View } from "react-native";
import { useRouter } from "expo-router";

interface SearchResultProps {
  cardIds: string[];
  cards?: Pick<CardType, "cardId" | "name" | "imagesLarge">[];
  loading?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onAllImagesLoaded?: () => void;
}

export default function SearchResult({
  cardIds,
  cards,
  loading,
  currentPage = 1,
  itemsPerPage = 20,
  onPageChange,
  onAllImagesLoaded,
}: SearchResultProps) {
  const router = useRouter();

  // Pagination logic
  const totalPages = Math.ceil((cardIds?.length || 0) / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedIds = cardIds.slice(startIdx, endIdx);

  // Track image loading
  const [imagesLoaded, setImagesLoaded] = React.useState(0);
  React.useEffect(() => {
    setImagesLoaded(0);
  }, [cardIds, currentPage]);
  React.useEffect(() => {
    if (paginatedIds.length > 0 && imagesLoaded === paginatedIds.length) {
      onAllImagesLoaded && onAllImagesLoaded();
    }
  }, [imagesLoaded, paginatedIds.length, onAllImagesLoaded]);

  // Handler for card navigation
  const handleCardPress = (cardId: string) => {
    router.push({
      pathname: "/cards/[cardId]",
      params: { cardId, from: "searchResult" },
    });
  };

  return (
    <ThemedView style={styles.wrapper}>
      <View style={styles.cardList}>
        {paginatedIds.map((item, idx) => {
          const cardData = cards?.find((c) => c.cardId === item);
          return (
            <View
              key={item + idx}
              onTouchEnd={() => handleCardPress(item)}
            >
              <CompactCard
                card={cardData || { cardId: "", name: "", imagesLarge: "" }}
                onImageLoad={() => setImagesLoaded((n) => n + 1)}
                loading={loading || !cardData}
              />
            </View>
          );
        })}
      </View>
      {totalPages > 1 && (
        <ThemedView layout="rounded">
          <ThemedButton
            title="Prev"
            type="main"
            size="small"
            status={currentPage <= 1 ? "disabled" : undefined}
            onPress={() => onPageChange && currentPage > 1 && onPageChange(currentPage - 1)}
          />
          <ThemedText
            type="default"
            style={styles.paginationText}
          >
            Page {currentPage} of {totalPages}
          </ThemedText>
          <ThemedButton
            title="Next"
            type="main"
            size="small"
            status={currentPage >= totalPages ? "disabled" : undefined}
            onPress={() => onPageChange && currentPage < totalPages && onPageChange(currentPage + 1)}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}
