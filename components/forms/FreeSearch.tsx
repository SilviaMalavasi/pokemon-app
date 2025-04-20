import React, { useState } from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import TextInput from "@/components/base/TextInput";
import { supabase } from "@/lib/supabase";
import Collapsible from "@/components/base/Collapsible";
import { Switch } from "react-native";
import { Colors } from "@/style/Colors";

export default function FreeSearch(): JSX.Element {
  const [cardSearch, setCardSearch] = useState("");

  // Only 'artist', 'flavorText', and 'rarity' can be excluded by the user
  const excludableCardColumns = [
    { key: "artist", label: "Artist" },
    { key: "flavorText", label: "Flavor Text" },
    { key: "rarity", label: "Rarity" },
  ];
  // By default, all are excluded (checked)
  const [excludedColumns, setExcludedColumns] = useState<Record<string, boolean>>(() => ({
    flavorText: true,
    artist: true,
    rarity: true,
  }));
  const handleToggleColumn = (key: string) => {
    setExcludedColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Columns to search in each table
  const cardSetColumns = ["setId", "name", "series"];
  const abilitiesColumns = ["name", "text"];
  const attacksColumns = ["name", "text", "damage"];
  const cardAttacksColumns = ["cost", "convertedEnergyCost"];

  const handleSubmit = async () => {
    console.log("handleSubmit called with:", cardSearch);
    const isNumeric = cardSearch.trim() !== "" && !isNaN(Number(cardSearch));
    const searchVariants = [
      cardSearch,
      cardSearch.charAt(0).toUpperCase() + cardSearch.slice(1),
      cardSearch.toLowerCase(),
    ];
    let cardIds = new Set();
    let cardResults: any[] = [];

    // 1. Search Card table directly
    // Card columns to search (excluding checked ones)
    const cardColumns = [
      "cardId",
      "name",
      "supertype",
      "subtypes",
      "hp",
      "types",
      "evolvesFrom",
      "weaknesses",
      "resistances",
      "evolvesTo",
      "convertedRetreatCost",
      "regulationMark",
      "rules",
      "number",
    ];
    if (!excludedColumns.flavorText) cardColumns.push("flavorText");
    if (!excludedColumns.artist) cardColumns.push("artist");
    if (!excludedColumns.rarity) cardColumns.push("rarity");
    let cardOrFilters: string[] = [];
    searchVariants.forEach((variant) => {
      cardOrFilters.push(...cardColumns.map((field) => `${field}.ilike.%${variant}%`));
    });
    if (isNumeric) {
      cardOrFilters.push("hp.eq." + Number(cardSearch));
      cardOrFilters.push("convertedRetreatCost.eq." + Number(cardSearch));
    }
    const { data: cardData, error: cardError } = await supabase.from("Card").select("*").or(cardOrFilters.join(","));
    if (cardError) {
      console.log("Supabase Card error:", cardError);
    } else if (cardData && cardData.length > 0) {
      cardData.forEach((c: any) => cardIds.add(c.id));
      cardResults.push(...cardData);
    }

    // 2. Search CardSet table, get Card by setId
    let cardSetOrFilters: string[] = [];
    searchVariants.forEach((variant) => {
      cardSetOrFilters.push(...cardSetColumns.map((field) => `${field}.ilike.%${variant}%`));
    });
    const { data: setData, error: setError } = await supabase
      .from("CardSet")
      .select("id")
      .or(cardSetOrFilters.join(","));
    if (!setError && setData && setData.length > 0) {
      const setIds = setData.map((s: any) => s.id);
      if (setIds.length > 0) {
        const { data: cardsBySet, error: cardsBySetError } = await supabase
          .from("Card")
          .select("*")
          .in("setId", setIds);
        if (!cardsBySetError && cardsBySet) {
          cardsBySet.forEach((c: any) => cardIds.add(c.id));
          cardResults.push(...cardsBySet);
        }
      }
    }

    // 3. Search Abilities, get Card by CardAbilities
    let abilitiesOrFilters: string[] = [];
    searchVariants.forEach((variant) => {
      abilitiesOrFilters.push(...abilitiesColumns.map((field) => `${field}.ilike.%${variant}%`));
    });
    const { data: abilitiesData, error: abilitiesError } = await supabase
      .from("Abilities")
      .select("id")
      .or(abilitiesOrFilters.join(","));
    if (!abilitiesError && abilitiesData && abilitiesData.length > 0) {
      const abilityIds = abilitiesData.map((a: any) => a.id);
      if (abilityIds.length > 0) {
        const { data: cardAbilities, error: cardAbilitiesError } = await supabase
          .from("CardAbilities")
          .select("cardId")
          .in("abilityId", abilityIds);
        if (!cardAbilitiesError && cardAbilities) {
          const cardAbilityIds = cardAbilities.map((ca: any) => ca.cardId);
          if (cardAbilityIds.length > 0) {
            const { data: cardsByAbility, error: cardsByAbilityError } = await supabase
              .from("Card")
              .select("*")
              .in("id", cardAbilityIds);
            if (!cardsByAbilityError && cardsByAbility) {
              cardsByAbility.forEach((c: any) => cardIds.add(c.id));
              cardResults.push(...cardsByAbility);
            }
          }
        }
      }
    }

    // 4. Search Attacks, get Card by CardAttacks
    let attacksOrFilters: string[] = [];
    searchVariants.forEach((variant) => {
      attacksOrFilters.push(...attacksColumns.map((field) => `${field}.ilike.%${variant}%`));
    });
    const { data: attacksData, error: attacksError } = await supabase
      .from("Attacks")
      .select("id")
      .or(attacksOrFilters.join(","));
    if (!attacksError && attacksData && attacksData.length > 0) {
      const attackIds = attacksData.map((a: any) => a.id);
      if (attackIds.length > 0) {
        const { data: cardAttacks, error: cardAttacksError } = await supabase
          .from("CardAttacks")
          .select("cardId")
          .in("attackId", attackIds);
        if (!cardAttacksError && cardAttacks) {
          const cardAttackIds = cardAttacks.map((ca: any) => ca.cardId);
          if (cardAttackIds.length > 0) {
            const { data: cardsByAttack, error: cardsByAttackError } = await supabase
              .from("Card")
              .select("*")
              .in("id", cardAttackIds);
            if (!cardsByAttackError && cardsByAttack) {
              cardsByAttack.forEach((c: any) => cardIds.add(c.id));
              cardResults.push(...cardsByAttack);
            }
          }
        }
      }
    }

    // 5. Search CardAttacks table directly (cost, convertedEnergyCost)
    let cardAttacksOrFilters: string[] = [];
    searchVariants.forEach((variant) => {
      cardAttacksOrFilters.push(...cardAttacksColumns.map((field) => `${field}.ilike.%${variant}%`));
    });
    if (isNumeric) {
      cardAttacksOrFilters.push("convertedEnergyCost.eq." + Number(cardSearch));
    }
    const { data: cardAttacksData, error: cardAttacksError } = await supabase
      .from("CardAttacks")
      .select("cardId")
      .or(cardAttacksOrFilters.join(","));
    if (!cardAttacksError && cardAttacksData && cardAttacksData.length > 0) {
      const cardAttackIds = cardAttacksData.map((ca: any) => ca.cardId);
      if (cardAttackIds.length > 0) {
        const { data: cardsByCardAttack, error: cardsByCardAttackError } = await supabase
          .from("Card")
          .select("*")
          .in("id", cardAttackIds);
        if (!cardsByCardAttackError && cardsByCardAttack) {
          cardsByCardAttack.forEach((c: any) => cardIds.add(c.id));
          cardResults.push(...cardsByCardAttack);
        }
      }
    }

    // Deduplicate results by Card id
    const uniqueCards = Array.from(new Map(cardResults.map((c: any) => [c.id, c])).values());
    console.log("Queried string:", cardSearch);
    if (uniqueCards.length === 0) {
      console.log("No results found for:", cardSearch);
    } else {
      console.log("Free search results:", uniqueCards);
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
      <Collapsible title="Exclude from search">
        {excludableCardColumns.map((col) => (
          <ThemedView
            key={col.key}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
          >
            <Switch
              value={excludedColumns[col.key]}
              onValueChange={() => handleToggleColumn(col.key)}
              trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
              thumbColor={excludedColumns[col.key] ? Colors.green : Colors.purple}
            />
            <ThemedText
              type="default"
              style={{ paddingLeft: 8 }}
            >
              {col.label}
            </ThemedText>
          </ThemedView>
        ))}
      </Collapsible>
      <ThemedButton
        title="Search"
        onPress={handleSubmit}
      />
    </ThemedView>
  );
}
