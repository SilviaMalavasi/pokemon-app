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
}) {
  const { freeForm, setFreeForm, lastSearchPage, clearFreeForm } = useSearchFormContext();
  const [cardSearch, setCardSearch] = useState("");
  // All card columns that can be excluded from search
  const allCardColumns = [
    { key: "name_Card", table: "Card", column: "name", label: "Card Name" },
    { key: "supertype_Card", table: "Card", column: "supertype", label: "Type" },
    { key: "subtypes_Card", table: "Card", column: "subtypes", label: "Label" },
    { key: "types_Card", table: "Card", column: "types", label: "Energy Type" },
    { key: "rules_Card", table: "Card", column: "rules", label: "Rules/Rule Box" },
    { key: "name_Attacks", table: "Attacks", column: "name", label: "Attack Name" },
    { key: "text_Attacks", table: "Attacks", column: "text", label: "Attack Text" },
    { key: "cost_CardAttacks", table: "CardAttacks", column: "cost", label: "Attack Cost Energy Type" },
    {
      key: "convertedEnergyCost_CardAttacks",
      table: "CardAttacks",
      column: "convertedEnergyCost",
      label: "Attack Cost",
    },
    { key: "damage_CardAttacks", table: "CardAttacks", column: "damage", label: "Attack Damage" },
    { key: "name_Abilities", table: "Abilities", column: "name", label: "Ability Name" },
    { key: "text_Abilities", table: "Abilities", column: "text", label: "Ability Text" },
    { key: "evolvesFrom_Card", table: "Card", column: "evolvesFrom", label: "Evolves From" },
    { key: "evolvesTo_Card", table: "Card", column: "evolvesTo", label: "Evolves To" },
    { key: "hp_Card", table: "Card", column: "hp", label: "Pokémon HP" },
    { key: "convertedRetreatCost_Card", table: "Card", column: "convertedRetreatCost", label: "Retreat Cost" },
    { key: "weaknesses_Card", table: "Card", column: "weaknesses", label: "Weaknesses" },
    { key: "resistances_Card", table: "Card", column: "resistances", label: "Resistances" },
    { key: "name_CardSet", table: "CardSet", column: "name", label: "Set Name" },
    { key: "regulationMark_Card", table: "Card", column: "regulationMark", label: "Regulation Mark" },
    { key: "cardId_Card", table: "Card", column: "cardId", label: "Pokédex Number" },
    { key: "flavorText_Card", table: "Card", column: "flavorText", label: "Flavor Text" },
    { key: "artist_Card", table: "Card", column: "artist", label: "Artist" },
  ];
  // By default, all fields are included (checked)
  const [includedColumns, setIncludedColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allCardColumns.forEach((col) => {
      // Start with 'artist' and 'flavorText' unchecked, all others checked
      if (col.column === "artist" || col.column === "flavorText") {
        initial[col.key] = false;
      } else {
        initial[col.key] = true;
      }
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
  const cardExclusions = ["id", "nationalPokedexNumbers", "imagesLarge", "setId", "rarity", "number"];
  const cardAttacksExclusions = ["id", "cardId", "attackId"];
  const attacksExclusions = ["id"];
  const abilitiesExclusions = ["id"];

  // Card columns to search (only include checked fields)
  const cardColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Card")
    .map((col) => col.column)
    .filter((key) => includedColumns[key]);

  // Attacks columns to search
  const attacksColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Attacks")
    .map((col) => col.column)
    .filter((key) => includedColumns[key]);

  // Abilities columns to search
  const abilitiesColumnsToSearch = allCardColumns
    .filter((col) => col.table === "Abilities")
    .map((col) => col.column)
    .filter((key) => includedColumns[key]);

  // CardAttacks columns to search
  const cardAttacksColumnsToSearch = allCardColumns
    .filter((col) => col.table === "CardAttacks")
    .map((col) => col.column)
    .filter((key) => includedColumns[key]);

  // CardSet columns to search
  const cardSetColumnsToSearch = allCardColumns
    .filter((col) => col.table === "CardSet")
    .map((col) => col.column)
    .filter((key) => includedColumns[key]);

  useEffect(() => {
    setCardSearch("");
    setIncludedColumns(() => {
      const initial: Record<string, boolean> = {};
      allCardColumns.forEach((col) => {
        if (col.column === "artist" || col.column === "flavorText") {
          initial[col.key] = false;
        } else {
          initial[col.key] = true;
        }
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
      // Collect all included (checked) columns as {table, column} pairs
      const includedTablesAndColumns = allCardColumns
        .filter((col) => includedColumns[col.key])
        .map((col) => ({ table: col.table, column: col.column }));
      // Use freeQueryBuilder for free search, passing includedTablesAndColumns
      const { cardIds, query } = await freeQueryBuilder(trimmedSearch, includedTablesAndColumns);
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
        if (col.column === "artist" || col.column === "flavorText") {
          initial[col.key] = false;
        } else {
          initial[col.key] = true;
        }
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
      cost: "Attack Cost Energy Type",
      convertedEnergyCost: "Attack Cost",
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

  // Helper: are all columns checked?
  const allKeys = allCardColumns.map((col) => col.key);
  const checkedCount = allKeys.filter((key) => includedColumns[key]).length;
  // On first render, force the button to say 'Uncheck all' and uncheck all fields
  const [toggleAllState, setToggleAllState] = useState<"uncheck" | "toggle">("uncheck");

  useEffect(() => {
    setToggleAllState("uncheck");
  }, [resetKey]);

  const allChecked = checkedCount === allKeys.length;
  const someChecked = checkedCount > 0 && checkedCount < allKeys.length;

  const handleToggleAll = () => {
    if (toggleAllState === "uncheck") {
      // Uncheck all fields
      setIncludedColumns((prev) => {
        const updated: Record<string, boolean> = {};
        allKeys.forEach((key) => {
          updated[key] = false;
        });
        return updated;
      });
      setToggleAllState("toggle");
    } else {
      // Normal toggle logic
      const newValue = !allChecked;
      setIncludedColumns((prev) => {
        const updated: Record<string, boolean> = {};
        allKeys.forEach((key) => {
          updated[key] = newValue;
        });
        return updated;
      });
    }
  };

  return (
    <ThemedView>
      <ThemedView style={styles.mainButtonsRow}>
        <ThemedButton
          title="Reset"
          size="small"
          width={vw(30)}
          type="alternative"
          onPress={handleReset}
        />
        <ThemedButton
          title={"Search"}
          width={vw(50)}
          icon="search"
          onPress={handleSubmit}
          status={loading || cardSearch.trim() === "" ? "disabled" : "default"}
          disabled={loading || cardSearch.trim() === ""}
        />
      </ThemedView>
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
        You can exclude database fields in the search by toggling them off.
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
                    ["supertype_Card", "subtypes_Card", "types_Card"].includes(col.key) ||
                    (col.key === "name_Card" && col.table === "Card")
                )
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={col.label}
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
                .filter((col) => col.key === "rules_Card")
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={col.label}
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
                      label={col.label}
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
                      label={col.label}
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
                      label={col.label}
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
                .filter((col) => ["hp_Card", "convertedRetreatCost_Card"].includes(col.key))
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={col.label}
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
                .filter((col) => ["evolvesFrom_Card", "evolvesTo_Card"].includes(col.key))
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={col.label}
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
                .filter((col) => ["weaknesses_Card", "resistances_Card"].includes(col.key))
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={col.label}
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
                .filter((col) => ["regulationMark_Card", "name_CardSet"].includes(col.key) && col.table === "CardSet")
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={col.label}
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
                .filter((col) => ["artist_Card", "flavorText_Card"].includes(col.key))
                .map((col) => (
                  <ThemedView key={`${col.table}-${col.key}`}>
                    <ThemedCheckbox
                      checked={includedColumns[col.key]}
                      onPress={() => handleToggleColumn(col.key)}
                      label={col.label}
                    />
                  </ThemedView>
                ))}
            </ThemedView>
          </ThemedCollapsible>
        </View>
      </ThemedView>
      {/* End collapsibles row */}
      <ThemedButton
        title={toggleAllState === "uncheck" ? "Uncheck all" : allChecked ? "Uncheck all" : "Check all"}
        size="small"
        type="alternative"
        width={vw(40)}
        onPress={handleToggleAll}
        style={{ marginTop: theme.padding.small, marginBottom: theme.padding.small }}
      />
      <ThemedSwitch
        value={removeDuplicates}
        label="Hide duplicates"
        onValueChange={onRemoveDuplicatesChange}
        hint="If enabled, cards with same stats but different images or sets will be displayed only once."
        style={styles.switchContainer}
      />
    </ThemedView>
  );
}
