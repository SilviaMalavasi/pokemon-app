import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import TextInput from "@/components/base/TextInput";
import Collapsible from "@/components/base/Collapsible";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import { Colors } from "@/style/base/Colors";
import { freeQueryBuilder } from "@/helpers/freeQueryBuilder";
import { useSearchFormContext } from "@/components/context/SearchFormContext";

export default function FreeSearchForm({
  onSearchResults,
  setLoading,
  resetKey,
  removeDuplicates,
  onRemoveDuplicatesChange,
}: {
  onSearchResults?: (ids: string[], query: string) => void;
  setLoading?: (loading: boolean) => void;
  resetKey?: number;
  removeDuplicates: boolean;
  onRemoveDuplicatesChange: (val: boolean) => void;
  currentPage: number;
  itemsPerPage: number;
}): JSX.Element {
  const { freeForm, setFreeForm, lastSearchType, clearFreeForm } = useSearchFormContext();
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
  // By default, all fields are included (checked)
  const [includedColumns, setIncludedColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allCardColumns.forEach((col) => {
      initial[col.key] = true;
    });
    return initial;
  });
  const handleToggleColumn = (key: string, sectionTitle?: string) => {
    setIncludedColumns((prev) => ({ ...prev, [key]: !prev[key] }));
    if (sectionTitle) {
      setCollapsibles((prev) => ({ ...prev, [sectionTitle]: true }));
    }
  };

  const [showHint, setShowHint] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Card Exclusion lists
  const cardExclusions = ["id", "nationalPokedexNumbers", "imagesSmall", "imagesLarge", "setId", "rarity", "number"];
  const cardAttacksExclusions = ["id", "cardId", "attackId"];
  const attacksExclusions = ["id"];
  const abilitiesExclusions = ["id"];

  // Card columns to search (only include checked fields)
  const cardColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Card")
    .map((col) => col.key)
    .filter((key) => includedColumns[key]);

  // Attacks columns to search
  const attacksColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Attacks")
    .map((col) => col.key)
    .filter((key) => includedColumns[key]);

  // Abilities columns to search
  const abilitiesColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Abilities")
    .map((col) => col.key)
    .filter((key) => includedColumns[key]);

  // CardAttacks columns to search
  const cardAttacksColumnsToSearch = allCardColumns
    .filter((col) => col.table === "CardAttacks")
    .map((col) => col.key)
    .filter((key) => includedColumns[key]);

  // CardSet columns to search
  const cardSetColumnsToSearch = allCardColumns
    .filter((col) => col.table === "CardSet")
    .map((col) => col.key)
    .filter((key) => includedColumns[key]);

  const [collapsibles, setCollapsibles] = useState<Record<string, boolean>>(freeForm?.collapsibles ?? {});
  const handleCollapsibleChange = (title: string, open: boolean) => {
    setCollapsibles((prev) => ({ ...prev, [title]: open }));
  };

  useEffect(() => {
    setCardSearch("");
    setIncludedColumns(() => {
      const initial: Record<string, boolean> = {};
      allCardColumns.forEach((col) => {
        initial[col.key] = true;
      });
      return initial;
    });
    setCollapsibles({});
  }, [resetKey]);

  // Log when saving to context
  const handleSubmit = async () => {
    setFreeForm({
      cardSearch,
      includedColumns,
      collapsibles,
      removeDuplicates,
    });
    setButtonLoading(true);
    if (setLoading) setLoading(true);
    let trimmedSearch = cardSearch.trim();
    if (!trimmedSearch) {
      if (setLoading) setLoading(false);
      setButtonLoading(false);
      if (onSearchResults) onSearchResults([], "");
      return;
    }
    try {
      // Collect all included (checked) columns
      const includedKeys = Object.keys(includedColumns).filter((key) => includedColumns[key]);
      // Use freeQueryBuilder for free search, passing includedKeys
      const { cardIds, query } = await freeQueryBuilder(trimmedSearch, includedKeys);
      if (onSearchResults) onSearchResults(cardIds, query);
    } catch (err: any) {
      console.error("[FreeSearch] freeQueryBuilder error:", err);
      if (onSearchResults) onSearchResults([], err.message || "Search failed");
    } finally {
      if (setLoading) setLoading(false);
      setButtonLoading(false);
    }
  };

  // Log when restoring from context
  useEffect(() => {
    if (lastSearchType === "free" && freeForm) {
      setCardSearch(freeForm.cardSearch);
      setIncludedColumns(freeForm.includedColumns);
      setCollapsibles(freeForm.collapsibles || {});
      if (freeForm.removeDuplicates !== undefined) {
        onRemoveDuplicatesChange(freeForm.removeDuplicates);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a local resetKey to force reset
  const [localResetKey, setLocalResetKey] = useState(0);

  // Reset handler
  const handleReset = () => {
    setCardSearch("");
    setIncludedColumns(() => {
      const initial: Record<string, boolean> = {};
      allCardColumns.forEach((col) => {
        initial[col.key] = true;
      });
      return initial;
    });
    setCollapsibles({});
    setShowHint(false);
    setButtonLoading(false);
    clearFreeForm();
    setLocalResetKey((k) => k + 1);
  };

  return (
    <ThemedView>
      <ThemedButton
        title="Reset"
        onPress={handleReset}
        style={{ marginBottom: 16 }}
      />
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
        You can include database fields in the search by toggling them on.
      </ThemedText>
      {/* Card Type */}
      <Collapsible
        title="Include: Card Type"
        resetKey={resetKey}
        open={collapsibles["Include: Card Type"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Card Type", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Card Type")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        title="Include: Evolution"
        resetKey={resetKey}
        open={collapsibles["Include: Evolution"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Evolution", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Evolution")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        title="Include: Card Rules"
        resetKey={resetKey}
        open={collapsibles["Include: Card Rules"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Card Rules", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Card Rules")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        title="Include: Attacks"
        resetKey={resetKey}
        open={collapsibles["Include: Attacks"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Attacks", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Attacks")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Attacks")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        title="Include: Abilities"
        resetKey={resetKey}
        open={collapsibles["Include: Abilities"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Abilities", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Abilities")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        title="Include: Stats"
        resetKey={resetKey}
        open={collapsibles["Include: Stats"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Stats", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Stats")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        title="Include: Weaknesses/Resistances"
        resetKey={resetKey}
        open={collapsibles["Include: Weaknesses/Resistances"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Weaknesses/Resistances", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Weaknesses/Resistances")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        title="Include: Edition"
        resetKey={resetKey}
        open={collapsibles["Include: Edition"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Edition", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Edition")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        title="Include: Artist/Flavor"
        resetKey={resetKey}
        open={collapsibles["Include: Artist/Flavor"] || false}
        onToggle={(open) => handleCollapsibleChange("Include: Artist/Flavor", open)}
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
                  value={includedColumns[col.key]}
                  onValueChange={() => handleToggleColumn(col.key, "Include: Artist/Flavor")}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.purple }}
                  thumbColor={includedColumns[col.key] ? Colors.green : Colors.purple}
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
        />
        <ThemedText
          type="default"
          style={{ paddingLeft: 8 }}
        >
          Remove duplicates
        </ThemedText>
        <TouchableOpacity
          onPress={() => setShowHint((v) => !v)}
          accessibilityLabel="Hint for Remove duplicates"
        >
          <ThemedText
            type="hintIcon"
            style={{ marginLeft: 8, marginTop: 4 }}
          >
            ?
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      {showHint && (
        <ThemedText
          type="hintText"
          style={{ marginTop: 4, marginLeft: 16 }}
        >
          If enabled, cards with same stats but different images or sets will be displayed only once.
        </ThemedText>
      )}

      <ThemedButton
        title={buttonLoading ? "Searching..." : "Search"}
        onPress={handleSubmit}
        disabled={buttonLoading}
        style={{ position: "relative" }}
      />
    </ThemedView>
  );
}
