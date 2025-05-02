import React, { useState, useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import ThemedCollapsible from "@/components/base/ThemedCollapsible";
import ThemedCheckbox from "@/components/base/ThemedCheckbox";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import { freeQueryBuilder } from "@/helpers/freeQueryBuilder";
import { useSearchFormContext } from "@/components/context/SearchFormContext";
import styles from "@/style/forms/FreeSearchFormStyle";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

export default function FreeSearchForm({
  onSearchResults,
  setLoading: setLoadingProp,
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
  const { freeForm, setFreeForm, lastSearchPage, clearFreeForm } = useSearchFormContext();
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
  const handleToggleColumn = (key: string) => {
    setIncludedColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [showHint, setShowHint] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setCardSearch("");
    setIncludedColumns(() => {
      const initial: Record<string, boolean> = {};
      allCardColumns.forEach((col) => {
        initial[col.key] = true;
      });
      return initial;
    });
  }, [resetKey]);

  // Log when saving to context
  const handleSubmit = async () => {
    setFreeForm({
      cardSearch,
      includedColumns,
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
    if (lastSearchPage === "free" && freeForm) {
      setCardSearch(freeForm.cardSearch);
      setIncludedColumns(freeForm.includedColumns);
      if (freeForm.removeDuplicates !== undefined) {
        onRemoveDuplicatesChange(freeForm.removeDuplicates);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a local resetKey to force reset
  const [localResetKey, setLocalResetKey] = useState(0);

  // Collapsible open state
  const collapsibleSections = [
    "CardType",
    "Evolution",
    "CardRules",
    "Attacks",
    "Abilities",
    "Stats",
    "WeaknessesResistances",
    "Edition",
    "ArtistFlavor",
  ];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    collapsibleSections.forEach((key) => {
      initial[key] = false;
    });
    return initial;
  });
  // Reset open sections on resetKey
  useEffect(() => {
    setOpenSections(() => {
      const initial: Record<string, boolean> = {};
      collapsibleSections.forEach((key) => {
        initial[key] = false;
      });
      return initial;
    });
  }, [resetKey]);
  const handleToggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    setShowHint(false);
    setButtonLoading(false);
    clearFreeForm();
    setLocalResetKey((k) => k + 1);
    onRemoveDuplicatesChange(false);
  };

  // Enhanced column label mapping per table
  const columnLabelsByTable: Record<string, Record<string, string>> = {
    Card: {
      name: "Card Name",
      supertype: "Type",
      subtypes: "Label",
      types: "Energy Type",
      rules: "Rules/Rule Box",
      evolvesFrom: "Evolves From",
      evolvesTo: "Evolves To",
      hp: "Pokémon HP",
      convertedRetreatCost: "Retreat Cost",
      weaknesses: "Weaknesses",
      resistances: "Resistances",
      regulationMark: "Regulation Mark",
      cardId: "Pokédex Number",
      flavorText: "Flavor Text",
      artist: "Artist",
    },
    Attacks: {
      name: "Attack Name",
      text: "Attack Text",
    },
    CardAttacks: {
      cost: "Attack Cost",
      convertedEnergyCost: "Attack Cost Energy Type",
      damage: "Attack Damage",
    },
    Abilities: {
      name: "Ability Name",
      text: "Ability Text",
    },
    CardSet: {
      name: "Set Name",
      regulationMark: "Regulation Mark",
    },
    // Fallback for columns not in a table
    _default: {
      flavorText: "Flavor Text",
      artist: "Artist",
    },
  };

  // Helper to get label by table and key
  function getColumnLabel(table: string | undefined, key: string): string {
    if (table && columnLabelsByTable[table] && columnLabelsByTable[table][key]) {
      return columnLabelsByTable[table][key];
    }
    if (columnLabelsByTable._default[key]) {
      return columnLabelsByTable._default[key];
    }
    return key;
  }

  return (
    <ThemedView>
      <ThemedTextInput
        label="Free Search"
        value={cardSearch}
        onChange={setCardSearch}
        placeholder="Free text"
      />
      <ThemedText
        style={styles.instructions}
        type="default"
        color={theme.colors.textAlternative}
      >
        You can exclude database fields in the search by toggling them on.
      </ThemedText>
      {/* Collapsibles in two columns */}
      <ThemedView style={styles.collapsibleContainer}>
        {/* Card Type */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Card Type"
            resetKey={resetKey}
            open={openSections.CardType}
            onToggle={() => handleToggleSection("CardType")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter(
                  (col) =>
                    ["supertype", "subtypes", "types"].includes(col.key) || (col.key === "name" && col.table === "Card")
                )
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
        {/* Card Rules */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Rules/Rule Box"
            resetKey={resetKey}
            open={openSections.CardRules}
            onToggle={() => handleToggleSection("CardRules")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter((col) => col.key === "rules")
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
        {/* Attacks */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Attacks"
            resetKey={resetKey}
            open={openSections.Attacks}
            onToggle={() => handleToggleSection("Attacks")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter((col) => col.table === "Attacks")
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
              {allCardColumns
                .filter((col) => col.table === "CardAttacks")
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
        {/* Abilities */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Abilities"
            resetKey={resetKey}
            open={openSections.Abilities}
            onToggle={() => handleToggleSection("Abilities")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter((col) => col.table === "Abilities")
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
        {/* Stats */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Stats"
            resetKey={resetKey}
            open={openSections.Stats}
            onToggle={() => handleToggleSection("Stats")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter((col) => ["hp", "convertedRetreatCost"].includes(col.key))
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
        {/* Evolution */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Evolution"
            resetKey={resetKey}
            open={openSections.Evolution}
            onToggle={() => handleToggleSection("Evolution")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter((col) => ["evolvesFrom", "evolvesTo"].includes(col.key))
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
        {/* Weaknesses/Resistances */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Weak/Res"
            resetKey={resetKey}
            open={openSections.WeaknessesResistances}
            onToggle={() => handleToggleSection("WeaknessesResistances")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter((col) => ["weaknesses", "resistances"].includes(col.key))
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
        {/* Edition */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Edition"
            resetKey={resetKey}
            open={openSections.Edition}
            onToggle={() => handleToggleSection("Edition")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter((col) => ["regulationMark", "name"].includes(col.key) && col.table === "CardSet")
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
        {/* Artist/Flavor */}
        <View style={styles.collapsibleItem}>
          <ThemedCollapsible
            title="Artist/Flavor"
            resetKey={resetKey}
            open={openSections.ArtistFlavor}
            onToggle={() => handleToggleSection("ArtistFlavor")}
          >
            <ThemedView style={{ marginBottom: 12 }}>
              {allCardColumns
                .filter((col) => ["artist", "flavorText"].includes(col.key))
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={getColumnLabel(col.table, col.key) || col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
      </ThemedView>
      {/* End collapsibles row */}
      <ThemedSwitch
        value={removeDuplicates}
        label="Hide duplicates"
        onValueChange={onRemoveDuplicatesChange}
        hint="If enabled, cards with same stats but different images or sets will be displayed only once."
        style={{ marginTop: theme.padding.small, marginBottom: theme.padding.xlarge }}
      />
      <ThemedView style={styles.mainButtonsRow}>
        <ThemedButton
          title="Reset"
          size="small"
          width={vw(25)}
          type="alternative"
          onPress={handleReset}
        />
        <ThemedButton
          title={"Search"}
          width={vw(55)}
          icon="search"
          onPress={handleSubmit}
          status={loading || cardSearch.trim() === "" ? "disabled" : "default"}
          disabled={loading || cardSearch.trim() === ""}
        />
      </ThemedView>
    </ThemedView>
  );
}
