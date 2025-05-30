import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import ThemedCollapsible from "@/components/base/ThemedCollapsible";
import ThemedCheckbox from "@/components/base/ThemedCheckbox";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import ThemedView from "@/components/base/ThemedView";
import { freeQueryBuilder } from "@/helpers/freeQueryBuilder";
import { useSearchFormContext } from "@/components/context/SearchFormContext";
import styles from "@/style/forms/FreeSearchFormStyle";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";

export default function FreeSearchForm({
  onSearchResults,
  setLoading: setLoadingProp,
  resetKey,
  removeDuplicates,
  onRemoveDuplicatesChange,
}: {
  onSearchResults?: (ids: string[], query: string) => void;
  setLoading?: (loading: boolean) => void;
  resetKey?: number;
  removeDuplicates: boolean;
  onRemoveDuplicatesChange: (val: boolean) => void;
}) {
  const { db, isLoading, isUpdating } = useCardDatabase();
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
    if (!db || isLoading || isUpdating) {
      if (setLoadingProp) setLoadingProp(false);
      setButtonLoading(false);
      return;
    }
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
      // Use freeQueryBuilder for free search, passing db and includedTablesAndColumns
      const { cardIds, query } = await freeQueryBuilder(db, trimmedSearch, includedTablesAndColumns);
      if (onSearchResults) onSearchResults(cardIds, query);
    } catch (err: unknown) {
      // Use unknown type for catch block
      console.error("[FreeSearch] freeQueryBuilder error:", err);
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      if (onSearchResults) onSearchResults([], errorMessage);
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

  // Helper: get checked fields for summary (label and key)
  const checkedFields = allCardColumns.filter((col) => includedColumns[col.key]);

  // State for "see more/less" functionality
  const [showFullSummary, setShowFullSummary] = useState(false);

  // Helper: render checked field labels separated by OR (no SVG, no dot)
  const renderCheckedLabelsSummary = () => {
    if (checkedFields.length === 0) return null;

    const fullSummary = checkedFields.map((field, idx) => (
      <React.Fragment key={field.key}>
        {idx > 0 && <ThemedText style={styles.summaryArrayTextSeparator}> OR </ThemedText>}
        <ThemedText>{field.label}</ThemedText>
      </React.Fragment>
    ));

    const fullSummaryText = checkedFields.map((field) => field.label).join(" OR ");

    if (fullSummaryText.length <= 140) {
      return <ThemedText style={styles.summaryArrayText}>{fullSummary}</ThemedText>;
    }

    return (
      <View>
        <ThemedText style={styles.summaryArrayText}>
          {showFullSummary ? (
            fullSummary
          ) : (
            <>
              {
                checkedFields.reduce(
                  (acc, field, idx) => {
                    const currentLabel = field.label;
                    const separator = idx > 0 ? " OR " : "";
                    if (acc.text.length + separator.length + currentLabel.length <= 140) {
                      acc.text += separator + currentLabel;
                      acc.elements.push(
                        <React.Fragment key={field.key}>
                          {idx > 0 && <ThemedText style={styles.summaryArrayTextSeparator}> OR </ThemedText>}
                          <ThemedText>{currentLabel}</ThemedText>
                        </React.Fragment>
                      );
                    } else if (acc.text.length < 140) {
                      const remainingSpace = 140 - acc.text.length - separator.length;
                      if (remainingSpace > 3) {
                        // space for "..."
                        const truncatedLabel = currentLabel.substring(0, remainingSpace - 3) + "...";
                        acc.text += separator + truncatedLabel;
                        acc.elements.push(
                          <React.Fragment key={field.key}>
                            {idx > 0 && <ThemedText style={styles.summaryArrayTextSeparator}> OR </ThemedText>}
                            <ThemedText>{truncatedLabel}</ThemedText>
                          </React.Fragment>
                        );
                      }
                    }
                    return acc;
                  },
                  { text: "", elements: [] as React.ReactNode[] }
                ).elements
              }
            </>
          )}
        </ThemedText>
        <TouchableOpacity
          onPress={() => setShowFullSummary(!showFullSummary)}
          style={{ alignItems: "flex-start", marginTop: theme.padding.xsmall }}
        >
          <ThemedText type="hintText">{showFullSummary ? "See less..." : "See more..."}</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      <ThemedView style={{ marginBottom: theme.padding.large * -1 }}>
        <ThemedTextInput
          value={cardSearch}
          onChange={setCardSearch}
          placeholder="Free text"
          style={{ marginTop: theme.padding.medium }}
        />
        <ThemedText
          type="hintText"
          style={styles.instructions}
        >
          You can exclude database fields in the search by toggling them off. By default all fields are included except
          "Artist" and "Flavor Text".{" "}
        </ThemedText>
        {/* Collapsibles in two columns */}
        <View style={styles.collapsibleContainer}>
          {/* Card Type */}
          <View style={styles.collapsibleItem}>
            <ThemedCollapsible
              title="Card Type"
              resetKey={resetKey}
              open={openSections.CardType}
              onToggle={() => handleToggleSection("CardType")}
            >
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter(
                    (col) =>
                      ["supertype_Card", "subtypes_Card", "types_Card"].includes(col.key) ||
                      (col.key === "name_Card" && col.table === "Card")
                  )
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
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
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter((col) => col.key === "rules_Card")
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
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
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter((col) => col.table === "Attacks")
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
                {allCardColumns
                  .filter((col) => col.table === "CardAttacks")
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
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
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter((col) => col.table === "Abilities")
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
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
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter((col) => ["hp_Card", "convertedRetreatCost_Card"].includes(col.key))
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
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
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter((col) => ["evolvesFrom_Card", "evolvesTo_Card"].includes(col.key))
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
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
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter((col) => ["weaknesses_Card", "resistances_Card"].includes(col.key))
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
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
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter((col) => ["regulationMark_Card", "name_CardSet"].includes(col.key) && col.table === "CardSet")
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
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
              <View style={{ marginBottom: 12 }}>
                {allCardColumns
                  .filter((col) => ["artist_Card", "flavorText_Card"].includes(col.key))
                  .map((col) => (
                    <View key={`${col.table}-${col.key}`}>
                      <ThemedCheckbox
                        checked={includedColumns[col.key]}
                        onPress={() => handleToggleColumn(col.key)}
                        label={col.label}
                      />
                    </View>
                  ))}
              </View>
            </ThemedCollapsible>
          </View>
        </View>
        {/* End collapsibles row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <ThemedButton
            title={toggleAllState === "uncheck" ? "Uncheck all" : allChecked ? "Uncheck all" : "Check all"}
            type="outline"
            size="small"
            width={vw(40)}
            onPress={handleToggleAll}
            style={{ marginTop: theme.padding.medium, marginBottom: theme.padding.large }}
          />
          <ThemedSwitch
            value={removeDuplicates}
            label="Hide duplicates"
            onValueChange={onRemoveDuplicatesChange}
            style={styles.switchContainer}
          />
        </View>
      </ThemedView>
      <ThemedView
        layout="rounded"
        style={{ position: "relative", zIndex: 2 }}
      >
        <ThemedButton
          title="Reset"
          size="small"
          width={showFullSummary ? vw(28) : vw(32)}
          type="alternative"
          onPress={handleReset}
          style={{ marginLeft: theme.padding.medium }}
        />
        <ThemedButton
          title={"Search"}
          type="main"
          width={vw(42)}
          size="large"
          onPress={handleSubmit}
          status={loading || cardSearch.trim() === "" ? "disabled" : "default"}
          disabled={loading || cardSearch.trim() === ""}
          style={{ marginRight: theme.padding.medium }}
        />
      </ThemedView>
      {/* Summary of checked fields styled as in AdvancedSearchForm */}
      {cardSearch.trim() !== "" && checkedFields.length > 0 && (
        <View>
          <LinearGradient
            colors={[theme.colors.darkGrey, theme.colors.mediumGrey]}
            start={{ x: 0.4, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.summaryContainer}
          >
            <ThemedText
              type="h4"
              style={styles.summaryTitle}
            >
              You are searching for:
            </ThemedText>
            <ThemedText
              color={theme.colors.green}
              style={{ paddingBottom: theme.padding.medium }}
            >
              {cardSearch}
            </ThemedText>

            <ThemedText
              type="h4"
              style={styles.summaryTitle}
            >
              In the following fields:
            </ThemedText>
            {renderCheckedLabelsSummary()}
          </LinearGradient>
        </View>
      )}
    </View>
  );
}
