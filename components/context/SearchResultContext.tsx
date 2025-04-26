import React, { createContext, useContext, useState } from "react";
import type { CardType } from "@/types/PokemonCardType";

interface SearchResultState {
  cardIds: string[];
  query: string;
  currentPage: number;
  itemsPerPage: number;
  cards: Pick<CardType, "cardId" | "name" | "imagesSmall">[];
  loading: boolean;
  setCardIds: (ids: string[]) => void;
  setQuery: (q: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (n: number) => void;
  setCards: (cards: Pick<CardType, "cardId" | "name" | "imagesSmall">[]) => void;
  setLoading: (loading: boolean) => void;
}

const SearchResultContext = createContext<SearchResultState | undefined>(undefined);

export function useSearchResultContext() {
  const ctx = useContext(SearchResultContext);
  if (!ctx) throw new Error("useSearchResultContext must be used within SearchResultProvider");
  return ctx;
}

export const SearchResultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [cards, setCards] = useState<Pick<CardType, "cardId" | "name" | "imagesSmall">[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <SearchResultContext.Provider
      value={{
        cardIds,
        query,
        currentPage,
        itemsPerPage,
        cards,
        loading,
        setCardIds,
        setQuery,
        setCurrentPage,
        setItemsPerPage,
        setCards,
        setLoading,
      }}
    >
      {children}
    </SearchResultContext.Provider>
  );
};
