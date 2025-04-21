import React from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";

interface SearchResultProps {
  cardIds: string[];
  query?: string;
  loading?: boolean;
}

const highlightText = (text: string, query: string) => {
  if (!query) return <ThemedText>{text}</ThemedText>;
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    regex.test(part) ? (
      <ThemedText
        key={idx}
        type="subtitle"
      >
        {part}
      </ThemedText>
    ) : (
      <ThemedText key={idx}>{part}</ThemedText>
    )
  );
};

export default function SearchResult({ cardIds, query, loading }: SearchResultProps): JSX.Element {
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
      {cardIds.map((item, idx) => (
        <ThemedView
          key={item + idx}
          style={{ marginBottom: 8 }}
        >
          <ThemedText type="default">{query ? highlightText(item, query) : item}</ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}
