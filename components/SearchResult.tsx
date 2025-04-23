import React from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";

interface SearchResultProps {
  cardIds: string[];
  query?: string;
  loading?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export default function SearchResult({
  cardIds,
  query,
  loading,
  currentPage = 1,
  itemsPerPage = 50,
  onPageChange,
}: SearchResultProps): JSX.Element {
  // Pagination logic
  const totalPages = Math.ceil((cardIds?.length || 0) / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedIds = cardIds.slice(startIdx, endIdx);

  if (loading) {
    return (
      <ThemedView style={{ padding: 16 }}>
        <ThemedText type="default">Loading...</ThemedText>
      </ThemedView>
    );
  }
  if (query && (!cardIds || cardIds.length === 0)) {
    return (
      <ThemedView style={{ padding: 16 }}>
        <ThemedText type="default">No Cards found.</ThemedText>
      </ThemedView>
    );
  }
  if (!cardIds || cardIds.length === 0) {
    // Don't show anything if no search has been done
    return <></>;
  }
  return (
    <ThemedView style={{ padding: 16 }}>
      {paginatedIds.map((item, idx) => (
        <ThemedView
          key={item + idx}
          style={{ marginBottom: 8 }}
        >
          <ThemedText type="default">{item}</ThemedText>
        </ThemedView>
      ))}
      {totalPages > 1 && (
        <ThemedView style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
          <ThemedButton
            type="alternative"
            title="Prev"
            size="small"
            onPress={() => onPageChange && currentPage > 1 && onPageChange(currentPage - 1)}
          />
          <ThemedText
            type="default"
            style={{ marginHorizontal: 8 }}
          >
            Page {currentPage} of {totalPages}
          </ThemedText>
          <ThemedButton
            type="alternative"
            title="Next"
            size="small"
            onPress={() => onPageChange && currentPage < totalPages && onPageChange(currentPage + 1)}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}
