import React, { useState, useEffect } from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import TextInput from "@/components/base/TextInput";
import Collapsible from "@/components/base/Collapsible";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import { Colors } from "@/style/base/Colors";
import { queryBuilder } from "@/helpers/queryBuilder";
import { supabase } from "@/lib/supabase";
import type { QueryBuilderFilter } from "@/helpers/queryBuilder";

export default function FreeSearchForm({
  onSearchResults,
  setLoading,
  resetKey,
  removeDuplicates,
  onRemoveDuplicatesChange,
  currentPage,
  itemsPerPage,
}: {
  onSearchResults?: (ids: string[], query: string) => void;
  setLoading?: (loading: boolean) => void;
  resetKey?: number;
  removeDuplicates: boolean;
  onRemoveDuplicatesChange: (val: boolean) => void;
  currentPage: number;
  itemsPerPage: number;
}): JSX.Element {
  const [cardSearch, setCardSearch] = useState("");
  // All card columns that can be excluded from search
  const allCardColumns = [
    { key: "name", table: "Card", label: "Name" },
    { key: "supertype", table: "Card", label: "Supertype" },
    { key: "subtypes", table: "Card", label: "Subtypes" },
    { key: "types", table: "Card", label: "Types" },
    { key: "rules", table: "Card", label: "Rules" },
    { key: "name", table: "Attacks", label: "Attack Name" },
    { key: "text", table: "Attacks", label: "Attack Text" },
    { key: "cost", table: "CardAttacks", label: "Attack Cost" },
    { key: "convertedEnergyCost", table: "CardAttacks", label: "Attack Converted Energy Cost" },
    { key: "damage", table: "CardAttacks", label: "Attack Damage" },
    { key: "name", table: "Abilities", label: "Abilities Name" },
    { key: "text", table: "Abilities", label: "Abilities Text" },
    { key: "evolvesFrom", table: "Card", label: "Evolves From" },
    { key: "evolvesTo", table: "Card", label: "Evolves To" },
    { key: "hp", table: "Card", label: "HP" },
    { key: "convertedRetreatCost", table: "Card", label: "Converted Retreat Cost" },
    { key: "weaknesses", table: "Card", label: "Weaknesses Type" },
    { key: "resistances", table: "Card", label: "Resistances Type" },
    { key: "name", table: "CardSet", label: "Set Name" },
    { key: "regulationMark", table: "Card", label: "Regulation Mark" },
    { key: "cardId", table: "Card", label: "Set/Number" },
    { key: "flavorText", label: "Flavor Text" },
    { key: "artist", label: "Artist" },
  ];
  // By default, only 'artist', 'flavorText', and 'rarity' are excluded (checked)
  const [excludedColumns, setExcludedColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allCardColumns.forEach((col) => {
      initial[col.key] = false;
    });
    return initial;
  });
  const handleToggleColumn = (key: string) => {
    setExcludedColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Card Exclusion lists
  const cardExclusions = ["id", "nationalPokedexNumbers", "imagesSmall", "imagesLarge", "setId", "rarity", "number"];
  const cardAttacksExclusions = ["id", "cardId", "attackId"];
  const attacksExclusions = ["id"];
  const abilitiesExclusions = ["id"];

  // Card columns to search (respect user toggles and exclusions)
  // Only include columns that actually belong to the Card table
  // Always exclude fixed exclusions (like 'number', 'cardId') and user-defined exclusions
  const fixedTextExclusions = ["number", "cardId"];
  const cardColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Card")
    .map((col) => col.key)
    .filter((key) => !cardExclusions.includes(key) && !fixedTextExclusions.includes(key) && !excludedColumns[key]);

  // Attacks columns to search
  const attacksColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Attacks")
    .map((col) => col.key)
    .filter((key) => !attacksExclusions.includes(key) && !excludedColumns[key]);

  // Abilities columns to search
  const abilitiesColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Abilities")
    .map((col) => col.key)
    .filter((key) => !abilitiesExclusions.includes(key) && !excludedColumns[key]);

  // CardAttacks columns to search
  const cardAttacksColumnsToSearch = allCardColumns
    .filter((col) => col.table === "CardAttacks")
    .map((col) => col.key)
    .filter((key) => !cardAttacksExclusions.includes(key) && !excludedColumns[key]);

  // CardSet columns to search
  const cardSetColumnsToSearch = allCardColumns
    .filter((col) => col.table === "CardSet")
    .map((col) => col.key)
    .filter((key) => !cardExclusions.includes(key) && !excludedColumns[key]);

  useEffect(() => {
    setCardSearch("");
    // Optionally reset other internal state if needed
  }, [resetKey]);

  const handleSubmit = async () => {
    if (setLoading) setLoading(true);
    let trimmedSearch = cardSearch.trim();
    if (!trimmedSearch) {
      if (setLoading) setLoading(false);
      if (onSearchResults) onSearchResults([], "");
      return;
    }
    // If search contains 'x' or '×', search for both variants
    let searchVariants = [
      trimmedSearch,
      trimmedSearch.charAt(0).toUpperCase() + trimmedSearch.slice(1),
      trimmedSearch.toLowerCase(),
    ];
    if (trimmedSearch.includes("x") || trimmedSearch.includes("×")) {
      const xVariant = trimmedSearch.replace(/×/g, "x");
      const timesVariant = trimmedSearch.replace(/x/g, "×");
      searchVariants.push(xVariant, timesVariant);
      searchVariants = Array.from(new Set(searchVariants));
    }
    const isNumeric = trimmedSearch !== "" && !isNaN(Number(trimmedSearch));

    // Build QueryBuilderFilter[] with OR logic for both text and numbers, split numeric OR by table
    const intColumns = ["hp", "convertedRetreatCost", "number"];
    const filters: QueryBuilderFilter[] = [];
    // Card numeric OR group
    let cardNumericOrFilters: QueryBuilderFilter[] = [];
    // CardAttacks numeric OR group
    let cardAttacksNumericOrFilters: QueryBuilderFilter[] = [];
    // Card text OR group
    let cardTextOrFilters: QueryBuilderFilter[] = [];
    // Card fields
    cardColumnsToSearch.forEach((col) => {
      if (isNumeric && intColumns.includes(col)) {
        cardNumericOrFilters.push({
          config: { key: col, type: "number", table: "Card", column: col, valueType: "int" },
          value: Number(trimmedSearch),
          operator: "=",
        });
      }
      // Always allow text search on text columns, even if isNumeric
      // But skip fixed exclusions (number, cardId) for text search
      if (!intColumns.includes(col)) {
        searchVariants.forEach((variant) => {
          cardTextOrFilters.push({
            config: { key: col, type: "text", table: "Card", column: col },
            value: variant,
          });
        });
      }
    });
    // CardAttacks numeric (for isNumeric)
    if (isNumeric) {
      cardAttacksColumnsToSearch.forEach((col) => {
        if (col === "convertedEnergyCost" && !excludedColumns[col]) {
          cardAttacksNumericOrFilters.push({
            config: { key: col, type: "number", table: "CardAttacks", column: col, valueType: "int" },
            value: Number(trimmedSearch),
            operator: "=",
          });
        }
        // Also search damage as text for exact match, only if not excluded
        if (col === "damage" && !excludedColumns[col]) {
          cardAttacksNumericOrFilters.push({
            config: { key: "damage", type: "text", table: "CardAttacks", column: "damage" },
            value: String(trimmedSearch),
            operator: "eq",
          });
        }
      });
    }
    if (cardNumericOrFilters.length > 0)
      filters.push({
        config: { key: "or", type: "number", table: "Card", column: "", logic: "or" },
        value: cardNumericOrFilters,
      });
    if (cardAttacksNumericOrFilters.length > 0)
      filters.push({
        config: { key: "or", type: "number", table: "CardAttacks", column: "", logic: "or" },
        value: cardAttacksNumericOrFilters,
      });
    if (cardTextOrFilters.length > 0)
      filters.push({
        config: { key: "or", type: "text", table: "Card", column: "", logic: "or" },
        value: cardTextOrFilters,
      });

    // Attacks fields (text only)
    let attacksOrFilters: QueryBuilderFilter[] = [];
    if (!isNumeric) {
      attacksColumnsToSearch.forEach((col) => {
        searchVariants.forEach((variant) => {
          attacksOrFilters.push({
            config: { key: col, type: "text", table: "Attacks", column: col },
            value: variant,
          });
        });
      });
      if (attacksOrFilters.length > 0)
        filters.push({
          config: { key: "or", type: "text", table: "Attacks", column: "", logic: "or" },
          value: attacksOrFilters,
        });
    }
    // Abilities fields (text only)
    let abilitiesOrFilters: QueryBuilderFilter[] = [];
    if (!isNumeric) {
      abilitiesColumnsToSearch.forEach((col) => {
        searchVariants.forEach((variant) => {
          abilitiesOrFilters.push({
            config: { key: col, type: "text", table: "Abilities", column: col },
            value: variant,
          });
        });
      });
      if (abilitiesOrFilters.length > 0)
        filters.push({
          config: { key: "or", type: "text", table: "Abilities", column: "", logic: "or" },
          value: abilitiesOrFilters,
        });
    }
    // CardAttacks fields (text only, except convertedEnergyCost)
    let cardAttacksOrFilters: QueryBuilderFilter[] = [];
    if (!isNumeric) {
      cardAttacksColumnsToSearch.forEach((col) => {
        if (col === "convertedEnergyCost" || excludedColumns[col]) return;
        searchVariants.forEach((variant) => {
          cardAttacksOrFilters.push({
            config: { key: col, type: "text", table: "CardAttacks", column: col },
            value: variant,
          });
        });
      });
      if (cardAttacksOrFilters.length > 0)
        filters.push({
          config: { key: "or", type: "text", table: "CardAttacks", column: "", logic: "or" },
          value: cardAttacksOrFilters,
        });
    }
    // CardSet fields (text only)
    let cardSetOrFilters: QueryBuilderFilter[] = [];
    if (!isNumeric) {
      cardSetColumnsToSearch.forEach((col) => {
        searchVariants.forEach((variant) => {
          cardSetOrFilters.push({
            config: { key: col, type: "text", table: "CardSet", column: col },
            value: variant,
          });
        });
      });
      if (cardSetOrFilters.length > 0)
        filters.push({
          config: { key: "or", type: "text", table: "CardSet", column: "", logic: "or" },
          value: cardSetOrFilters,
        });
    }
    // Query
    try {
      const { cardIds, query } = await queryBuilder(filters);
      if (onSearchResults) onSearchResults(cardIds, query);
      // Fetch and log card names for the returned cardIds (only for paginated IDs)
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const paginatedIds = cardIds.slice(startIdx, endIdx);
      if (paginatedIds.length > 0) {
        const { data, error } = await supabase.from("Card").select("cardId, name").in("cardId", paginatedIds);
        if (error) {
          console.error("Error fetching card names:", error.message);
        }
      }
    } catch (err: any) {
      console.error("[FreeSearch] queryBuilder error:", err);
      if (onSearchResults) onSearchResults([], err.message || "Search failed");
    } finally {
      if (setLoading) setLoading(false);
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
      <ThemedText
        style={{ paddingTop: 8, paddingBottom: 24 }}
        type="default"
      >
        You can exclude database fields from the search by toggling them off.
      </ThemedText>
      {/* Card Type */}
      <Collapsible
        title="Exclude: Card Type"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => ["supertype", "subtypes", "types"].includes(col.key))
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      {/* Card Rules */}
      <Collapsible
        title="Exclude: Card Rules"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => col.key === "rules")
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      {/* Attacks */}
      <Collapsible
        title="Exclude: Attacks"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => col.table === "Attacks")
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
          {allCardColumns
            .filter((col) => col.table === "CardAttacks")
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      {/* Abilities */}
      <Collapsible
        title="Exclude: Abilities"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => col.table === "Abilities")
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      {/* Evolution */}
      <Collapsible
        title="Exclude: Evolution"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => ["evolvesFrom", "evolvesTo"].includes(col.key))
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      {/* Stats */}
      <Collapsible
        title="Exclude: Stats"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => ["hp", "convertedRetreatCost"].includes(col.key))
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      {/* Weaknesses/Resistances */}
      <Collapsible
        title="Exclude: Weaknesses/Resistances"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => ["weaknesses", "resistances"].includes(col.key))
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      {/* Edition */}
      <Collapsible
        title="Exclude: Edition"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => ["regulationMark", "name"].includes(col.key) && col.table === "CardSet")
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      {/* Artist/Flavor */}
      <Collapsible
        title="Exclude: Artist/Flavor"
        resetKey={resetKey}
      >
        <ThemedView style={{ marginBottom: 12 }}>
          {allCardColumns
            .filter((col) => ["artist", "flavorText"].includes(col.key))
            .map((col) => (
              <ThemedView
                key={`${col.table}-${col.key}`}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <ThemedSwitch
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
        </ThemedView>
      </Collapsible>
      <ThemedView style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
        <ThemedSwitch
          value={removeDuplicates}
          onValueChange={onRemoveDuplicatesChange}
          trackColor={{ false: Colors.mediumGrey, true: Colors.green }}
          thumbColor={removeDuplicates ? Colors.green : Colors.purple}
        />
        <ThemedText
          type="default"
          style={{ paddingLeft: 8 }}
        >
          Remove duplicates
        </ThemedText>
      </ThemedView>
      <ThemedButton
        title="Search"
        onPress={handleSubmit}
      />
    </ThemedView>
  );
}
