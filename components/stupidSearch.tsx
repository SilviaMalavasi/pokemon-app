"use client";

import React, { useState } from "react";
import axios from "axios";
import { PokemonCard } from "../types/PokemonCardType";
import Image from "next/image";

// Helper to parse JSON fields if needed
const parseIfString = <T,>(field: T | string | null): T | null => {
  if (typeof field === "string") {
    try {
      return JSON.parse(field) as T;
    } catch {
      return null;
    }
  }
  return field as T;
};

const StupidSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonCard[]>([]);

  const handleSearch = async () => {
    // Sanitize and lowercase the query before sending
    const sanitized = query.trim().toLowerCase();
    if (!sanitized) return;
    try {
      const response = await axios.get<PokemonCard[]>("/api/stupidSearchAPI", {
        params: { query: sanitized },
      });
      const parsedResults = response.data.map((card) => ({
        ...card,
        subtypes: parseIfString<string[]>(card.subtypes) || [],
        types: parseIfString<string[]>(card.types) || [],
        evolvesTo: parseIfString<string[]>(card.evolvesTo) || [],
        weaknesses: parseIfString<{ type: string; value: string }[]>(card.weaknesses) || [],
        resistances: parseIfString<{ type: string; value: string }[]>(card.resistances) || [],
        retreatCost: parseIfString<string[]>(card.retreatCost) || [],
        nationalPokedexNumbers: parseIfString<number[]>(card.nationalPokedexNumbers) || [],
        rules: parseIfString<string[]>(card.rules) || [],
      }));
      setResults(parsedResults);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="stupid-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for Pokémon cards..."
      />
      <button onClick={handleSearch}>Search</button>

      <div className="results">
        {results.map((card, index) => (
          <div
            key={index}
            className="card"
          >
            {card.images?.small && (
              <Image
                src={card.images.small}
                alt={card.name}
                width={100}
                height={140}
              />
            )}
            <h3>{card.name}</h3>
            <p>Supertype: {card.supertype}</p>
            <p>Subtypes: {Array.isArray(card.subtypes) ? card.subtypes.join(", ") : String(card.subtypes || "")}</p>
            <p>Types: {Array.isArray(card.types) ? card.types.join(", ") : String(card.types || "")}</p>
            <p>HP: {card.hp}</p>
            {card.evolvesFrom && <p>Evolves From: {card.evolvesFrom}</p>}
            {card.evolvesTo && (
              <p>
                Evolves To: {Array.isArray(card.evolvesTo) ? card.evolvesTo.join(", ") : String(card.evolvesTo || "")}
              </p>
            )}
            {card.attacks && (
              <div>
                <h4>Attacks:</h4>
                {card.attacks.map((attack, i) => (
                  <div key={i}>
                    <p>Name: {attack.name}</p>
                    <p>Damage: {attack.damage}</p>
                    <p>Text: {attack.text}</p>
                    <p>Cost: {Array.isArray(attack.cost) ? attack.cost.join(", ") : String(attack.cost || "")}</p>
                    <p>Converted Energy Cost: {attack.convertedEnergyCost}</p>
                  </div>
                ))}
              </div>
            )}
            {card.abilities && (
              <div>
                <h4>Abilities:</h4>
                {card.abilities.map((ability, i) => (
                  <div key={i}>
                    <p>Name: {ability.name}</p>
                    <p>Text: {ability.text}</p>
                  </div>
                ))}
              </div>
            )}
            {card.weaknesses && Array.isArray(card.weaknesses) && card.weaknesses.length > 0 ? (
              <p>Weaknesses: {card.weaknesses.map((w) => `${w.type} (${w.value})`).join(", ")}</p>
            ) : null}
            {card.resistances && Array.isArray(card.resistances) && card.resistances.length > 0 ? (
              <p>Resistances: {card.resistances.map((r) => `${r.type} (${r.value})`).join(", ")}</p>
            ) : null}
            {card.retreatCost && Array.isArray(card.retreatCost) && card.retreatCost.length > 0 ? (
              <p>Retreat Cost: {card.retreatCost.join(", ")}</p>
            ) : null}
            <p>Card Set: {`${card.cardSet.name} (${card.cardSet.series})`}</p>
            <p>Number: {card.number}</p>
            {card.regulationMark && <p>Regulation Mark: {card.regulationMark}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StupidSearch;
