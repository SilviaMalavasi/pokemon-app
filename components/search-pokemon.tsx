"use client";

import React, { useState } from "react";
import "../styles/components/search-pokemon.scss";
import { PokemonCard, Attack, Ability, Weakness, Legalities, CardImages, CardSet } from "../types/PokemonCardType";

const SearchPokemon = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    cards: PokemonCard[];
    attacks: Attack[];
    abilities: Ability[];
    weaknesses: Weakness[];
    legalities: Legalities[];
    images: CardImages[];
    cardSet: CardSet[];
  }>({
    cards: [],
    attacks: [],
    abilities: [],
    weaknesses: [],
    legalities: [],
    images: [],
    cardSet: [],
  });

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/searchPokemonAPI?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="searchContainer">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search Pokémon"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="searchInput"
        />
        <button
          type="submit"
          className="searchButton"
        >
          Search
        </button>
      </form>
      <div className="resultsContainer">
        {Object.entries(results).map(([table, entries]) => (
          <div
            key={table}
            className="resultTable"
          >
            <h2>{table}</h2>
            {entries.map((entry, index) => (
              <div
                key={index}
                className="resultCard"
              >
                {Object.entries(entry).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPokemon;
