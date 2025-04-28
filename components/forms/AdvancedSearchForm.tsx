import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import NumberInput from "@/components/base/NumberInput";
import Collapsible from "@/components/base/Collapsible";
import { queryBuilder } from "@/helpers/queryBuilder";
import type { QueryBuilderFilter } from "@/helpers/queryBuilder";
import ThemedText from "@/components/base/ThemedText";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import { Dropdown } from "react-native-element-dropdown";
import AutoCompleteInput from "@/components/base/AutoCompleteInput";
import { supabase } from "@/lib/supabase";
import dynamicMultiSelectStyle from "@/style/base/DynamicMultiSelectStyle";
import styles from "@/style/forms/AdvancedSearchFormStyle";
import { theme } from "@/style/ui/Theme";
import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";
import { useSearchFormContext } from "@/components/context/SearchFormContext";
import CardTypeModal from "@/components/forms/modals/CardTypeModal";

const cardSupertypeOptions = uniqueIdentifiers.cardSupertype.map((v: string) => ({ value: v, label: v }));
const cardStageOptions = uniqueIdentifiers.cardStagePokémon.map((v: string) => ({ value: v, label: v }));
const cardTypesOptions = uniqueIdentifiers.cardTypes.map((v: string) => ({ value: v, label: v }));
const cardRegulationMarkOptions = uniqueIdentifiers.cardRegulationMark.map((v: string) => ({ value: v, label: v }));
const cardSetNamesOptions = uniqueIdentifiers.cardSetNames.map((v: string) => ({ value: v, label: v }));
const cardWeaknessesTypeOptions = uniqueIdentifiers.cardWeaknessTypes.map((v: string) => ({ value: v, label: v }));
const cardResistancesTypeOptions = uniqueIdentifiers.cardResistanceTypes.map((v: string) => ({ value: v, label: v }));
const energyTypesOptions = uniqueIdentifiers.energyTypes.map((v: string) => ({ value: v, label: v }));

const allSubtypes = Array.from(
  new Set([
    ...(uniqueIdentifiers.cardSubtypePokémon || []),
    ...(uniqueIdentifiers.cardSubtypeTrainer || []),
    ...(uniqueIdentifiers.cardSubtypeEnergy || []),
  ])
);

const getCardSubtypesOptions = (supertypes: string[]) => {
  let subtypeSet = new Set<string>();

  if (!supertypes || supertypes.length === 0) {
    allSubtypes.forEach((v) => subtypeSet.add(v));
  } else {
    supertypes.forEach((supertype) => {
      if (supertype === "Pokémon" && uniqueIdentifiers.cardSubtypePokémon) {
        uniqueIdentifiers.cardSubtypePokémon.forEach((v: string) => subtypeSet.add(v));
      } else if (supertype === "Trainer" && uniqueIdentifiers.cardSubtypeTrainer) {
        uniqueIdentifiers.cardSubtypeTrainer.forEach((v: string) => subtypeSet.add(v));
      } else if (supertype === "Energy" && uniqueIdentifiers.cardSubtypeEnergy) {
        uniqueIdentifiers.cardSubtypeEnergy.forEach((v: string) => subtypeSet.add(v));
      }
    });
  }
  return Array.from(subtypeSet).map((v) => ({ value: v, label: v }));
};

export default function AdvancedSearchForm({
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
  // Context for form state
  const { advancedForm, setAdvancedForm, lastSearchPage, clearAdvancedForm } = useSearchFormContext();

  // State for all fields
  const [cardSupertype, setCardSupertype] = useState<string[]>(advancedForm?.cardSupertype ?? []);
  const [cardSubtypes, setCardSubtypes] = useState<string[]>(advancedForm?.cardSubtypes ?? []);
  const [cardName, setCardName] = useState(advancedForm?.cardName ?? "");
  const [cardHp, setCardHp] = useState<number | "">(advancedForm?.cardHp ?? "");
  const [cardHpOperator, setCardHpOperator] = useState(advancedForm?.cardHpOperator ?? "=");
  const [cardTypes, setCardTypes] = useState<string[]>(advancedForm?.cardTypes ?? []);
  const [cardEvolvesFrom, setCardEvolvesFrom] = useState(advancedForm?.cardEvolvesFrom ?? "");
  const [cardEvolvesTo, setCardEvolvesTo] = useState(advancedForm?.cardEvolvesTo ?? "");
  const [cardRules, setCardRules] = useState(advancedForm?.cardRules ?? "");
  const [abilitiesName, setAbilitiesName] = useState(advancedForm?.abilitiesName ?? "");
  const [abilitiesText, setAbilitiesText] = useState(advancedForm?.abilitiesText ?? "");
  const [attacksName, setAttacksName] = useState(advancedForm?.attacksName ?? "");
  const [attacksDamage, setAttacksDamage] = useState<number | "">(advancedForm?.attacksDamage ?? "");
  const [attacksDamageOperator, setAttacksDamageOperator] = useState(advancedForm?.attacksDamageOperator ?? "=");
  const [attacksText, setAttacksText] = useState(advancedForm?.attacksText ?? "");
  const [attacksCost, setAttacksCost] = useState<string[]>(advancedForm?.attacksCost ?? []);
  const [attacksConvertedEnergyCost, setAttacksConvertedEnergyCost] = useState<number | "">(
    advancedForm?.attacksConvertedEnergyCost ?? ""
  );
  const [attacksConvertedEnergyCostOperator, setAttacksConvertedEnergyCostOperator] = useState(
    advancedForm?.attacksConvertedEnergyCostOperator ?? "="
  );
  const [cardWeaknessesType, setCardWeaknessesType] = useState<string[]>(advancedForm?.cardWeaknessesType ?? []);
  const [cardResistancesType, setCardResistancesType] = useState<string[]>(advancedForm?.cardResistancesType ?? []);
  const [cardConvertedRetreatCost, setCardConvertedRetreatCost] = useState<number | "">(
    advancedForm?.cardConvertedRetreatCost ?? ""
  );
  const [cardConvertedRetreatCostOperator, setCardConvertedRetreatCostOperator] = useState(
    advancedForm?.cardConvertedRetreatCostOperator ?? "="
  );
  const [cardArtist, setCardArtist] = useState(advancedForm?.cardArtist ?? "");
  const [cardFlavor, setCardFlavor] = useState(advancedForm?.cardFlavor ?? "");
  const [cardRegulationMark, setCardRegulationMark] = useState<string[]>(advancedForm?.cardRegulationMark ?? []);
  const [cardSetName, setCardSetName] = useState<string[]>(advancedForm?.cardSetName ?? []);
  const [cardNumber, setCardNumber] = useState<number | "">(advancedForm?.cardNumber ?? "");
  const [cardStage, setCardStage] = useState<string[]>(advancedForm?.cardStage ?? []);
  const [cardSetNumber, setCardSetNumber] = useState(advancedForm?.cardSetNumber ?? "");
  const [hasAnyAbility, setHasAnyAbility] = useState(advancedForm?.hasAnyAbility ?? false);
  const [attacksCostSlots, setAttacksCostSlots] = useState<string[]>(advancedForm?.attacksCostSlots ?? []);
  // Collapsible open state
  const [collapsibles, setCollapsibles] = useState<Record<string, boolean>>(advancedForm?.collapsibles ?? {});

  // Local state
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  // Add a local resetKey to force reset
  const [localResetKey, setLocalResetKey] = useState(0);
  const [cardTypeModalVisible, setCardTypeModalVisible] = useState(false);

  // Reset handler
  const handleReset = () => {
    // Reset all local state
    setCardSupertype([]);
    setCardSubtypes([]);
    setCardName("");
    setCardHp("");
    setCardHpOperator("=");
    setCardTypes([]);
    setCardEvolvesFrom("");
    setCardEvolvesTo("");
    setCardRules("");
    setAbilitiesName("");
    setAbilitiesText("");
    setAttacksName("");
    setAttacksDamage("");
    setAttacksDamageOperator("=");
    setAttacksText("");
    setAttacksCost([]);
    setAttacksConvertedEnergyCost("");
    setAttacksConvertedEnergyCostOperator("=");
    setCardWeaknessesType([]);
    setCardResistancesType([]);
    setCardConvertedRetreatCost("");
    setCardConvertedRetreatCostOperator("=");
    setCardArtist("");
    setCardFlavor("");
    setCardRegulationMark([]);
    setCardSetName([]);
    setCardNumber("");
    setCardStage([]);
    setCardSetNumber("");
    setAttacksCostSlots([]);
    setHasAnyAbility(false);
    setCollapsibles({});
    setShowHint(false);
    setError(null);
    clearAdvancedForm();
    setLocalResetKey((k) => k + 1);
    onRemoveDuplicatesChange(false);
  };

  // Save form to context
  const saveFormToContext = () => {
    setAdvancedForm({
      cardSupertype,
      cardSubtypes,
      cardName,
      cardHp,
      cardHpOperator,
      cardTypes,
      cardEvolvesFrom,
      cardEvolvesTo,
      cardRules,
      abilitiesName,
      abilitiesText,
      attacksName,
      attacksDamage,
      attacksDamageOperator,
      attacksText,
      attacksCost,
      attacksConvertedEnergyCost,
      attacksConvertedEnergyCostOperator,
      cardWeaknessesType,
      cardResistancesType,
      cardConvertedRetreatCost,
      cardConvertedRetreatCostOperator,
      cardArtist,
      cardFlavor,
      cardRegulationMark,
      cardSetName,
      cardNumber,
      cardStage,
      cardSetNumber,
      hasAnyAbility,
      attacksCostSlots,
      collapsibles,
      removeDuplicates,
    });
  };

  // Reset form fields when resetKey changes
  useEffect(() => {
    setCardSupertype([]);
    setCardSubtypes([]);
    setCardName("");
    setCardHp("");
    setCardHpOperator("=");
    setCardTypes([]);
    setCardEvolvesFrom("");
    setCardEvolvesTo("");
    setCardRules("");
    setAbilitiesName("");
    setAbilitiesText("");
    setAttacksName("");
    setAttacksDamage("");
    setAttacksDamageOperator("=");
    setAttacksText("");
    setAttacksCost([]);
    setAttacksConvertedEnergyCost("");
    setAttacksConvertedEnergyCostOperator("=");
    setCardWeaknessesType([]);
    setCardResistancesType([]);
    setCardConvertedRetreatCost("");
    setCardConvertedRetreatCostOperator("=");
    setCardArtist("");
    setCardFlavor("");
    setCardRegulationMark([]);
    setCardSetName([]);
    setCardNumber("");
    setCardStage([]);
    setCardSetNumber("");
    setAttacksCostSlots([]);
    setHasAnyAbility(false);
    setCollapsibles({});
  }, [resetKey]);

  // Reset subtypes when supertype changes
  useEffect(() => {
    setCardSubtypes([]);
  }, [cardSupertype]);

  useEffect(() => {
    if (
      attacksConvertedEnergyCostOperator === "=" &&
      attacksConvertedEnergyCost &&
      Number(attacksConvertedEnergyCost) > 0
    ) {
      setAttacksCostSlots(Array(Number(attacksConvertedEnergyCost)).fill(""));
    } else {
      setAttacksCostSlots([]);
    }
  }, [attacksConvertedEnergyCost, attacksConvertedEnergyCostOperator]);

  // Collapsible open/close handler
  const handleCollapsibleChange = (title: string, open: boolean) => {
    setCollapsibles((prev) => ({ ...prev, [title]: open }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (setLoadingProp) setLoadingProp(true);
    setLoading(true);
    setButtonLoading(true);
    setError(null);
    saveFormToContext();

    // Build filters array
    const filters: QueryBuilderFilter[] = [
      cardName && {
        config: { key: "cardName", type: "text", table: "Card", column: "name" },
        value: cardName,
      },
      cardSupertype.length > 0 && {
        config: { key: "cardSupertype", type: "multiselect", table: "Card", column: "supertype" },
        value: cardSupertype,
      },
      cardSubtypes.length > 0 && {
        config: {
          key: "cardSubtypes",
          type: "multiselect",
          table: "Card",
          column: "subtypes",
          valueType: "json-string-array",
        },
        value: cardSubtypes,
      },
      cardTypes.length > 0 && {
        config: {
          key: "cardTypes",
          type: "multiselect",
          table: "Card",
          column: "types",
          valueType: "json-string-array",
        },
        value: cardTypes,
      },
      cardRules && {
        config: { key: "rules", type: "text", table: "Card", column: "rules" },
        value: cardRules,
      },
      attacksName && {
        config: { key: "attackName", type: "text", table: "Attacks", column: "name" },
        value: attacksName,
      },
      attacksDamage !== "" && {
        config: { key: "attackDamage", type: "number", table: "CardAttacks", column: "damage", valueType: "text" },
        value: attacksDamage,
        operator: attacksDamageOperator,
      },
      attacksText && {
        config: { key: "attackText", type: "text", table: "Attacks", column: "text" },
        value: attacksText,
      },
      attacksCost.length > 0 && {
        config: { key: "attackCost", type: "multiselect", table: "CardAttacks", column: "cost" },
        value: attacksCost,
      },
      attacksConvertedEnergyCost !== "" && {
        config: {
          key: "attacksConvertedEnergyCost",
          type: "number",
          table: "CardAttacks",
          column: "convertedEnergyCost",
          valueType: "int",
        },
        value: attacksConvertedEnergyCost,
        operator: attacksConvertedEnergyCostOperator,
      },
      abilitiesName && {
        config: { key: "abilityName", type: "text", table: "Abilities", column: "name" },
        value: abilitiesName,
      },
      abilitiesText && {
        config: { key: "abilityText", type: "text", table: "Abilities", column: "text" },
        value: abilitiesText,
      },
      hasAnyAbility && {
        config: { key: "hasAnyAbility", type: "exists", table: "CardAbilities", column: "cardId" },
        value: true,
      },
      cardStage.length > 0 && {
        config: { key: "stage", type: "multiselect", table: "Card", column: "subtypes" },
        value: cardStage,
      },
      cardEvolvesFrom && {
        config: { key: "evolvesFrom", type: "text", table: "Card", column: "evolvesFrom" },
        value: cardEvolvesFrom,
      },
      cardEvolvesTo && {
        config: { key: "evolvesTo", type: "text", table: "Card", column: "evolvesTo", valueType: "json-string-array" },
        value: cardEvolvesTo,
      },
      cardHp !== "" && {
        config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
        value: cardHp,
        operator: cardHpOperator,
      },
      cardConvertedRetreatCost !== "" && {
        config: {
          key: "convertedRetreatCost",
          type: "number",
          table: "Card",
          column: "convertedRetreatCost",
          valueType: "int",
        },
        value: cardConvertedRetreatCost,
        operator: cardConvertedRetreatCostOperator,
      },
      cardWeaknessesType.length > 0 && {
        config: {
          key: "weaknesses",
          type: "multiselect",
          table: "Card",
          column: "weaknesses",
          valueType: "json-string-array",
        },
        value: cardWeaknessesType,
      },
      cardResistancesType.length > 0 && {
        config: {
          key: "resistances",
          type: "multiselect",
          table: "Card",
          column: "resistances",
          valueType: "json-string-array",
        },
        value: cardResistancesType,
      },
      cardArtist && {
        config: { key: "artist", type: "text", table: "Card", column: "artist" },
        value: cardArtist,
      },
      cardFlavor && {
        config: { key: "flavorText", type: "text", table: "Card", column: "flavorText" },
        value: cardFlavor,
      },
      cardRegulationMark.length > 0 && {
        config: { key: "regulationMark", type: "multiselect", table: "Card", column: "regulationMark" },
        value: cardRegulationMark,
      },
      cardSetName.length > 0 && {
        config: { key: "setName", type: "multiselect", table: "CardSet", column: "name" },
        value: cardSetName,
      },
      cardNumber !== "" && {
        config: { key: "number", type: "number", table: "Card", column: "number", valueType: "text" },
        value: cardNumber,
        operator: "=",
      },
      cardSetNumber && {
        config: { key: "cardSetNumber", type: "text", table: "Card", column: "cardId" },
        value: cardSetNumber,
      },
      attacksConvertedEnergyCostOperator === "=" &&
        attacksConvertedEnergyCost !== "" &&
        attacksCostSlots.length > 0 &&
        attacksCostSlots.some((v) => v) && {
          config: {
            key: "costSlots",
            type: "multiselect",
            table: "CardAttacks",
            column: "cost",
            valueType: "json-string-array",
          },
          value: attacksCostSlots,
        },
    ].filter(Boolean) as QueryBuilderFilter[];
    try {
      const { cardIds, query } = await queryBuilder(filters);
      setCardIds(cardIds);
      setSearchQuery(query);
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
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
      setButtonLoading(false);
      if (setLoadingProp) setLoadingProp(false);
    }
  };

  const cardSubtypesOptions = getCardSubtypesOptions(cardSupertype);

  return (
    <ThemedView>
      <ThemedTextInput
        label="Name"
        value={cardName}
        onChange={setCardName}
        placeholder="Card name"
        style={{ marginBottom: theme.padding.medium }}
      />
      <ThemedView style={styles.buttonRow}>
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status={cardSupertype.length > 0 || cardSubtypes.length > 0 || cardTypes.length > 0 ? "active" : "default"}
          title="card type"
          onPress={() => setCardTypeModalVisible(true)}
          style={styles.halfButton}
        />
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status="default"
          title="evolution"
          onPress={() => {
            console.log("Button pressed!");
          }}
          style={styles.halfButton}
        />
      </ThemedView>
      <ThemedView style={styles.buttonRow}>
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status="default"
          title="stats"
          onPress={() => {
            console.log("Button pressed!");
          }}
          style={styles.halfButton}
        />
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status="default"
          title="rules"
          onPress={() => {
            console.log("Button pressed!");
          }}
          style={styles.halfButton}
        />
      </ThemedView>
      <ThemedView style={styles.buttonRow}>
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status="default"
          title="attacks"
          onPress={() => {
            console.log("Button pressed!");
          }}
          style={styles.halfButton}
        />
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status="default"
          title="abilities"
          onPress={() => {
            console.log("Button pressed!");
          }}
          style={styles.halfButton}
        />
      </ThemedView>
      <ThemedView style={{ ...styles.buttonRow, marginBottom: theme.padding.medium }}>
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status="default"
          title="weak/res"
          onPress={() => {
            console.log("Button pressed!");
          }}
          style={styles.halfButton}
        />
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status="default"
          title="edition"
          onPress={() => {
            console.log("Button pressed!");
          }}
          style={styles.halfButton}
        />
      </ThemedView>
      <CardTypeModal
        visible={cardTypeModalVisible}
        onClose={() => setCardTypeModalVisible(false)}
        cardSupertype={cardSupertype}
        setCardSupertype={setCardSupertype}
        cardSubtypes={cardSubtypes}
        setCardSubtypes={setCardSubtypes}
        cardTypes={cardTypes}
        setCardTypes={setCardTypes}
        cardSupertypeOptions={cardSupertypeOptions}
        cardSubtypesOptions={cardSubtypesOptions}
        cardTypesOptions={cardTypesOptions}
      />
      {(cardSupertype.length === 0 || cardSupertype.includes("Pokémon")) && (
        <Collapsible
          title="Evolution"
          resetKey={resetKey}
        >
          <DynamicMultiSelect
            label="Stage"
            value={cardStage}
            options={cardStageOptions}
            onChange={setCardStage}
            labelHint="Include cards that match ANY of the selected choices."
          />
          <ThemedTextInput
            label="Evolves From"
            value={cardEvolvesFrom}
            onChange={setCardEvolvesFrom}
            placeholder="Evolves from"
          />
          <ThemedTextInput
            label="Evolves To"
            value={cardEvolvesTo}
            onChange={setCardEvolvesTo}
            placeholder="Evolves to"
          />
        </Collapsible>
      )}
      {(cardSupertype.length === 0 || cardSupertype.includes("Trainer")) && (
        <Collapsible
          title="Card Rules"
          resetKey={resetKey}
        >
          <AutoCompleteInput
            label="Rules"
            value={cardRules}
            onChange={setCardRules}
            suggestions={["search", "discard pile", "attach", "energy"]}
            placeholder="Card rules"
          />
        </Collapsible>
      )}
      {(cardSupertype.length === 0 || cardSupertype.includes("Pokémon")) && (
        <Collapsible
          title="Attacks"
          resetKey={resetKey}
        >
          <ThemedTextInput
            label="Attack Name"
            value={attacksName}
            onChange={setAttacksName}
            placeholder="Attack name"
          />
          <NumberInput
            label="Attack Damage"
            value={attacksDamage}
            onChange={(val, op) => {
              setAttacksDamage(val);
              setAttacksDamageOperator(op);
            }}
            placeholder="Attack damage"
            showOperatorSelect={"advanced"}
          />

          <AutoCompleteInput
            label="Attack Text"
            value={attacksText}
            onChange={setAttacksText}
            suggestions={["search", "discard pile", "attach", "energy"]}
            placeholder="Attack text"
          />
          <NumberInput
            label="Attacks Converted Energy Cost"
            value={attacksConvertedEnergyCost}
            onChange={(val, op) => {
              setAttacksConvertedEnergyCost(val);
              setAttacksConvertedEnergyCostOperator(op);
            }}
            placeholder="Converted energy cost"
            showOperatorSelect={"basic"}
          />

          {(!attacksConvertedEnergyCostOperator ||
            !attacksConvertedEnergyCost ||
            attacksConvertedEnergyCostOperator !== "=") && (
            <DynamicMultiSelect
              label="Attack Cost"
              value={attacksCost}
              options={energyTypesOptions}
              onChange={setAttacksCost}
              labelHint="Include cards that match ANY of the selected choices."
            />
          )}
          {attacksConvertedEnergyCostOperator === "=" &&
            attacksConvertedEnergyCost &&
            Number(attacksConvertedEnergyCost) > 0 && (
              <>
                {Array.from({ length: Number(attacksConvertedEnergyCost) }).map((_, idx) => (
                  <Dropdown
                    key={idx}
                    style={{ marginVertical: 8 }}
                    data={energyTypesOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select type"
                    containerStyle={dynamicMultiSelectStyle.listContainer}
                    itemTextStyle={dynamicMultiSelectStyle.listItem}
                    selectedTextStyle={dynamicMultiSelectStyle.selectedItemText}
                    placeholderStyle={dynamicMultiSelectStyle.label}
                    value={attacksCostSlots[idx] || ""}
                    onChange={(item) => {
                      const newSlots = [...attacksCostSlots];
                      newSlots[idx] = item.value;
                      setAttacksCostSlots(newSlots);
                    }}
                  />
                ))}
              </>
            )}
        </Collapsible>
      )}
      {(cardSupertype.length === 0 || cardSupertype.includes("Pokémon")) && (
        <Collapsible
          title="Abilities"
          resetKey={resetKey}
        >
          <ThemedTextInput
            label="Abilities Name"
            value={abilitiesName}
            onChange={setAbilitiesName}
            placeholder="Ability name"
          />
          <AutoCompleteInput
            label="Abilities Text"
            value={abilitiesText}
            onChange={setAbilitiesText}
            suggestions={["search", "discard pile", "attach", "energy"]}
            placeholder="Ability text"
          />
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <ThemedSwitch
              value={hasAnyAbility}
              onValueChange={setHasAnyAbility}
            />
            <ThemedText
              type="default"
              style={{ paddingLeft: 8 }}
            >
              Has any ability
            </ThemedText>
          </ThemedView>
        </Collapsible>
      )}

      {(cardSupertype.length === 0 || cardSupertype.includes("Pokémon")) && (
        <Collapsible
          title="Stats"
          resetKey={resetKey}
        >
          <NumberInput
            label="HP"
            value={cardHp}
            onChange={(val, op) => {
              setCardHp(val);
              setCardHpOperator(op);
            }}
            placeholder="Card HP"
            showOperatorSelect={"basic"}
          />
          <NumberInput
            label="Card Converted Retreat Cost"
            value={cardConvertedRetreatCost}
            onChange={(val, op) => {
              setCardConvertedRetreatCost(val);
              setCardConvertedRetreatCostOperator(op);
            }}
            placeholder="Retreat cost"
            showOperatorSelect={"basic"}
          />
        </Collapsible>
      )}
      {(cardSupertype.length === 0 || cardSupertype.includes("Pokémon")) && (
        <Collapsible
          title="Weaknesses/Resistances"
          resetKey={resetKey}
        >
          <DynamicMultiSelect
            label="Weaknesses Type"
            value={cardWeaknessesType}
            options={cardWeaknessesTypeOptions}
            onChange={setCardWeaknessesType}
            labelHint="Include cards that match ANY of the selected choices."
          />
          <DynamicMultiSelect
            label="Resistances Type"
            value={cardResistancesType}
            options={cardResistancesTypeOptions}
            onChange={setCardResistancesType}
            labelHint="Include cards that match ANY of the selected choices."
          />
        </Collapsible>
      )}
      <Collapsible
        title="Edition"
        resetKey={resetKey}
      >
        <DynamicMultiSelect
          label="Regulation Mark"
          value={cardRegulationMark}
          options={cardRegulationMarkOptions}
          onChange={setCardRegulationMark}
          labelHint="Include cards that match ANY of the selected choices."
        />
        <DynamicMultiSelect
          label="Set Name"
          value={cardSetName}
          options={cardSetNamesOptions}
          onChange={setCardSetName}
          labelHint="Include cards that match ANY of the selected choices."
        />
        <NumberInput
          label="Card Number"
          value={cardNumber}
          onChange={setCardNumber}
          placeholder="Card number"
        />
        <ThemedTextInput
          label="Card/Set Number"
          value={cardSetNumber}
          onChange={setCardSetNumber}
          placeholder="Card/Set Number"
        />
      </Collapsible>
      <Collapsible
        title="Artist/Flavor"
        resetKey={resetKey}
      >
        <ThemedTextInput
          label="Artist"
          value={cardArtist}
          onChange={setCardArtist}
          placeholder="Artist"
        />
        <ThemedTextInput
          label="Flavor"
          value={cardFlavor}
          onChange={setCardFlavor}
          placeholder="Flavor text"
        />
      </Collapsible>
      {/* CardType summary before reset button */}
      {(cardSupertype.length > 0 || cardSubtypes.length > 0 || cardTypes.length > 0) && (
        <ThemedView style={{ marginBottom: 8 }}>
          <ThemedText type="default">
            {cardSupertype.length > 0 && `Supertype: ${cardSupertype.join(", ")}`}
            {cardSubtypes.length > 0 && `${cardSupertype.length > 0 ? " | " : ""}Subtypes: ${cardSubtypes.join(", ")}`}
            {cardTypes.length > 0 &&
              `${cardSupertype.length > 0 || cardSubtypes.length > 0 ? " | " : ""}Types: ${cardTypes.join(", ")}`}
          </ThemedText>
        </ThemedView>
      )}
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
        title="Reset"
        onPress={handleReset}
        style={{ marginBottom: 16 }}
      />
      <ThemedButton
        title={buttonLoading ? "Searching..." : "Search"}
        onPress={handleSubmit}
        disabled={buttonLoading}
        style={{ position: "relative" }}
      />
      {error && (
        <ThemedText
          type="default"
          style={{ color: "red" }}
        >
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}
