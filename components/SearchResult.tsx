import React from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import CompactCard from "@/components/CompactCard";
import { CardType } from "@/types/PokemonCardType";
import SearchResultStyle from "@/style/SearchResultStyle";

interface SearchResultProps {
  cardIds: string[];
  cards?: Pick<CardType, "cardId" | "name" | "imagesLarge">[];
  query?: string;
  loading?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onAllImagesLoaded?: () => void;
}

export default function SearchResult({
  cardIds,
  cards,
  query,
  loading,
  currentPage = 1,
  itemsPerPage = 20,
  onPageChange,
  onAllImagesLoaded,
}: SearchResultProps) {
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

  return (
    <ThemedView>
      <ThemedView style={SearchResultStyle.cardList}>
        {paginatedIds.map((item, idx) => {
          const cardData = cards?.find((c) => c.cardId === item);
          return (
            <ThemedView key={item + idx}>
              <CompactCard
                card={cardData || { cardId: "", name: "", imagesLarge: "" }}
                onImageLoad={() => setImagesLoaded((n) => n + 1)}
                loading={loading || !cardData}
              />
            </ThemedView>
          );
        })}
      </ThemedView>
      {totalPages > 1 && (
        <ThemedView style={SearchResultStyle.paginationContainer}>
          <ThemedButton
            type="alternative"
            title="Prev"
            size="small"
            status={currentPage <= 1 ? "disabled" : undefined}
            onPress={() => onPageChange && currentPage > 1 && onPageChange(currentPage - 1)}
          />
          <ThemedText
            type="default"
            style={SearchResultStyle.paginationText}
          >
            Page {currentPage} of {totalPages}
          </ThemedText>
          <ThemedButton
            type="alternative"
            title="Next"
            size="small"
            status={currentPage >= totalPages ? "disabled" : undefined}
            onPress={() => onPageChange && currentPage < totalPages && onPageChange(currentPage + 1)}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}
