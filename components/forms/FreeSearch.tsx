import React, { useState } from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import TextInput from "@/components/base/TextInput";
import { supabase } from "@/lib/supabase";

export default function FreeSearch(): JSX.Element {
  const [cardSearch, setCardSearch] = useState("");

  const handleSubmit = async () => {
    console.log("handleSubmit called with:", cardSearch);
    const textFields = [
      "name",
      "supertype",
      "subtypes",
      "types",
      "rules",
      "evolvesFrom",
      "evolvesTo",
      "weaknesses",
      "resistances",
      "retreatCost",
      "flavorText",
      "artist",
      "rarity",
      "nationalPokedexNumbers",
      "regulationMark",
      "imagesSmall",
      "imagesLarge",
      "number",
    ];
    const intFields = ["hp", "convertedRetreatCost", "setId"];
    const isNumeric = cardSearch.trim() !== "" && !isNaN(Number(cardSearch));
    const searchVariants = [
      cardSearch,
      cardSearch.charAt(0).toUpperCase() + cardSearch.slice(1),
      cardSearch.toLowerCase(),
    ];
    const orFilters = [];
    searchVariants.forEach((variant) => {
      orFilters.push(...textFields.map((field) => `${field}.ilike.%${variant}%`));
    });
    if (isNumeric) {
      orFilters.push(...intFields.map((field) => `${field}.eq.${Number(cardSearch)}`));
    }
    console.log("Supabase query filter:", orFilters.join(","));
    const { data, error } = await supabase.from("Card").select("*").or(orFilters.join(","));
    console.log("Queried string:", cardSearch);
    if (error) {
      console.log("Supabase error:", error);
    } else if (!data || data.length === 0) {
      console.log("No results found for:", cardSearch);
    } else {
      console.log("Free search results:", data);
    }
  };

  return (
    <ThemedView>
      <TextInput
        label="Free Search"
        value={cardSearch}
        onChange={setCardSearch}
        placeholder="Free text"
      />
      <ThemedButton
        title="Search"
        onPress={handleSubmit}
      />
    </ThemedView>
  );
}
