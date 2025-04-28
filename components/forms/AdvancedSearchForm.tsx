import React, { useState, useEffect } from "react";

import { TouchableOpacity } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";

import { useSearchFormContext } from "@/components/context/SearchFormContext";
import { queryBuilder } from "@/helpers/queryBuilder";
import type { QueryBuilderFilter } from "@/helpers/queryBuilder";
import { supabase } from "@/lib/supabase";

import uniqueIdentifiers from "@/db/uniqueIdentifiers.json";

import CardTypeModal from "@/components/forms/modals/CardTypeModal";
import RulesModal from "@/components/forms/modals/RulesModal";
import AttacksModal from "@/components/forms/modals/AttacksModal";
import AbilitiesModal from "@/components/forms/modals/AbilitiesModal";
import StatsModal from "@/components/forms/modals/StatsModal";
import EvolutionModal from "@/components/forms/modals/EvolutionModal";
import WeakResModal from "@/components/forms/modals/WeakResModal";
import EditionModal from "@/components/forms/modals/EditionModal";

import styles from "@/style/forms/AdvancedSearchFormStyle";
import { theme } from "@/style/ui/Theme";

const cardStageOptions = uniqueIdentifiers.cardStagePokémon.map((v: string) => ({ value: v, label: v }));
const cardRegulationMarkOptions = uniqueIdentifiers.cardRegulationMark.map((v: string) => ({ value: v, label: v }));
const cardSetNamesOptions = uniqueIdentifiers.cardSetNames.map((v: string) => ({ value: v, label: v }));
const cardWeaknessesTypeOptions = uniqueIdentifiers.cardWeaknessTypes.map((v: string) => ({ value: v, label: v }));
const cardResistancesTypeOptions = uniqueIdentifiers.cardResistanceTypes.map((v: string) => ({ value: v, label: v }));
const energyTypesOptions = uniqueIdentifiers.energyTypes.map((v: string) => ({ value: v, label: v }));

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
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [attacksModalVisible, setAttacksModalVisible] = useState(false);
  const [abilitiesModalVisible, setAbilitiesModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [evolutionModalVisible, setEvolutionModalVisible] = useState(false);
  const [weakResModalVisible, setWeakResModalVisible] = useState(false);
  const [editionModalVisible, setEditionModalVisible] = useState(false);

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
          status={cardRules ? "active" : "default"}
          title="rules"
          onPress={() => setRulesModalVisible(true)}
          style={styles.halfButton}
        />
      </ThemedView>
      <ThemedView style={styles.buttonRow}>
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status={
            attacksName ||
            attacksDamage !== "" ||
            attacksText ||
            attacksCost.length > 0 ||
            attacksConvertedEnergyCost !== "" ||
            (attacksCostSlots && attacksCostSlots.some((v) => v))
              ? "active"
              : "default"
          }
          title="attacks"
          onPress={() => setAttacksModalVisible(true)}
          style={styles.halfButton}
        />
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status={abilitiesName || abilitiesText || hasAnyAbility ? "active" : "default"}
          title="abilities"
          onPress={() => setAbilitiesModalVisible(true)}
          style={styles.halfButton}
        />
      </ThemedView>
      <ThemedView style={styles.buttonRow}>
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status={cardHp !== "" || cardConvertedRetreatCost !== "" ? "active" : "default"}
          title="stats"
          onPress={() => setStatsModalVisible(true)}
          style={styles.halfButton}
        />
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status={cardStage.length > 0 || cardEvolvesFrom || cardEvolvesTo ? "active" : "default"}
          title="evolution"
          onPress={() => setEvolutionModalVisible(true)}
          style={styles.halfButton}
        />
      </ThemedView>
      <ThemedView style={{ ...styles.buttonRow, marginBottom: theme.padding.medium }}>
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status={cardWeaknessesType.length > 0 || cardResistancesType.length > 0 ? "active" : "default"}
          title="weak/res"
          onPress={() => setWeakResModalVisible(true)}
          style={styles.halfButton}
        />
        <ThemedButton
          type="outline"
          size="small"
          disabled={false}
          icon="arrow"
          status={
            cardRegulationMark.length > 0 || cardSetName.length > 0 || cardNumber !== "" || cardSetNumber
              ? "active"
              : "default"
          }
          title="edition"
          onPress={() => setEditionModalVisible(true)}
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
      />
      <RulesModal
        visible={rulesModalVisible}
        onClose={() => setRulesModalVisible(false)}
        cardRules={cardRules}
        setCardRules={setCardRules}
      />
      <AttacksModal
        visible={attacksModalVisible}
        onClose={() => setAttacksModalVisible(false)}
        attacksName={attacksName}
        setAttacksName={setAttacksName}
        attacksDamage={attacksDamage}
        setAttacksDamage={setAttacksDamage}
        attacksDamageOperator={attacksDamageOperator}
        setAttacksDamageOperator={setAttacksDamageOperator}
        attacksText={attacksText}
        setAttacksText={setAttacksText}
        attacksCost={attacksCost}
        setAttacksCost={setAttacksCost}
        attacksConvertedEnergyCost={attacksConvertedEnergyCost}
        setAttacksConvertedEnergyCost={setAttacksConvertedEnergyCost}
        attacksConvertedEnergyCostOperator={attacksConvertedEnergyCostOperator}
        setAttacksConvertedEnergyCostOperator={setAttacksConvertedEnergyCostOperator}
        attacksCostSlots={attacksCostSlots}
        setAttacksCostSlots={setAttacksCostSlots}
        energyTypesOptions={energyTypesOptions}
      />
      <AbilitiesModal
        visible={abilitiesModalVisible}
        onClose={() => setAbilitiesModalVisible(false)}
        abilitiesName={abilitiesName}
        setAbilitiesName={setAbilitiesName}
        abilitiesText={abilitiesText}
        setAbilitiesText={setAbilitiesText}
        hasAnyAbility={hasAnyAbility}
        setHasAnyAbility={setHasAnyAbility}
      />
      <StatsModal
        visible={statsModalVisible}
        onClose={() => setStatsModalVisible(false)}
        cardHp={cardHp}
        setCardHp={setCardHp}
        cardHpOperator={cardHpOperator}
        setCardHpOperator={setCardHpOperator}
        cardConvertedRetreatCost={cardConvertedRetreatCost}
        setCardConvertedRetreatCost={setCardConvertedRetreatCost}
        cardConvertedRetreatCostOperator={cardConvertedRetreatCostOperator}
        setCardConvertedRetreatCostOperator={setCardConvertedRetreatCostOperator}
      />
      <EvolutionModal
        visible={evolutionModalVisible}
        onClose={() => setEvolutionModalVisible(false)}
        cardStage={cardStage}
        setCardStage={setCardStage}
        cardEvolvesFrom={cardEvolvesFrom}
        setCardEvolvesFrom={setCardEvolvesFrom}
        cardEvolvesTo={cardEvolvesTo}
        setCardEvolvesTo={setCardEvolvesTo}
        cardStageOptions={cardStageOptions}
      />
      <WeakResModal
        visible={weakResModalVisible}
        onClose={() => setWeakResModalVisible(false)}
        cardWeaknessesType={cardWeaknessesType}
        setCardWeaknessesType={setCardWeaknessesType}
        cardResistancesType={cardResistancesType}
        setCardResistancesType={setCardResistancesType}
        cardWeaknessesTypeOptions={cardWeaknessesTypeOptions}
        cardResistancesTypeOptions={cardResistancesTypeOptions}
      />
      <EditionModal
        visible={editionModalVisible}
        onClose={() => setEditionModalVisible(false)}
        cardRegulationMark={cardRegulationMark}
        setCardRegulationMark={setCardRegulationMark}
        cardSetName={cardSetName}
        setCardSetName={setCardSetName}
        cardNumber={cardNumber}
        setCardNumber={setCardNumber}
        cardSetNumber={cardSetNumber}
        setCardSetNumber={setCardSetNumber}
        cardRegulationMarkOptions={cardRegulationMarkOptions}
        cardSetNamesOptions={cardSetNamesOptions}
      />
      <ThemedView style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
        <ThemedSwitch
          value={removeDuplicates}
          onValueChange={onRemoveDuplicatesChange}
        />
        <ThemedText
          type="default"
          style={{ paddingLeft: 8 }}
        >
          Hide duplicates
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
      {/* Card Type, Name, and Rules summary before reset button */}
      {(cardName || cardSupertype.length > 0 || cardSubtypes.length > 0 || cardTypes.length > 0 || cardRules) && (
        <ThemedView style={{ marginBottom: 8 }}>
          <ThemedText type="default">
            {cardName && `Card Name: ${cardName}`}
            {cardSupertype.length > 0 && `${cardName ? " | " : ""}Supertype: ${cardSupertype.join(", ")}`}
            {cardSubtypes.length > 0 &&
              `${cardName || cardSupertype.length > 0 ? " | " : ""}Subtypes: ${cardSubtypes.join(", ")}`}
            {cardTypes.length > 0 &&
              `${cardName || cardSupertype.length > 0 || cardSubtypes.length > 0 ? " | " : ""}Types: ${cardTypes.join(
                ", "
              )}`}
            {cardRules &&
              `${
                cardName || cardSupertype.length > 0 || cardSubtypes.length > 0 || cardTypes.length > 0 ? " | " : ""
              }Rules: ${cardRules}`}
          </ThemedText>
        </ThemedView>
      )}
      {/* Attacks summary before reset button */}
      {(attacksName ||
        attacksDamage !== "" ||
        attacksText ||
        attacksCost.length > 0 ||
        attacksConvertedEnergyCost !== "" ||
        (attacksCostSlots && attacksCostSlots.some((v) => v))) && (
        <ThemedView style={{ marginBottom: 8 }}>
          <ThemedText type="default">
            {attacksName && `Attack Name: ${attacksName}`}
            {attacksDamage !== "" &&
              `${attacksName ? " | " : ""}Attack Damage: ${attacksDamageOperator} ${attacksDamage}`}
            {attacksText && `${attacksName || attacksDamage !== "" ? " | " : ""}Attack Text: ${attacksText}`}
            {attacksCost.length > 0 &&
              `${attacksName || attacksDamage !== "" || attacksText ? " | " : ""}Attack Cost: ${attacksCost.join(
                ", "
              )}`}
            {attacksConvertedEnergyCost !== "" &&
              `${
                attacksName || attacksDamage !== "" || attacksText || attacksCost.length > 0 ? " | " : ""
              }Converted Energy Cost: ${attacksConvertedEnergyCostOperator} ${attacksConvertedEnergyCost}`}
            {attacksCostSlots &&
              attacksCostSlots.some((v) => v) &&
              `${
                attacksName ||
                attacksDamage !== "" ||
                attacksText ||
                attacksCost.length > 0 ||
                attacksConvertedEnergyCost !== ""
                  ? " | "
                  : ""
              }Cost Slots: ${attacksCostSlots.filter(Boolean).join(", ")}`}
          </ThemedText>
        </ThemedView>
      )}
      {/* Abilities summary before reset button */}
      {(abilitiesName || abilitiesText || hasAnyAbility) && (
        <ThemedView style={{ marginBottom: 8 }}>
          <ThemedText type="default">
            {abilitiesName && `Ability Name: ${abilitiesName}`}
            {abilitiesText && `${abilitiesName ? " | " : ""}Ability Text: ${abilitiesText}`}
            {hasAnyAbility && `${abilitiesName || abilitiesText ? " | " : ""}Has any ability`}
          </ThemedText>
        </ThemedView>
      )}
      {/* Stats summary before reset button */}
      {(cardHp !== "" || cardConvertedRetreatCost !== "") && (
        <ThemedView style={{ marginBottom: 8 }}>
          <ThemedText type="default">
            {cardHp !== "" && `HP: ${cardHpOperator} ${cardHp}`}
            {cardConvertedRetreatCost !== "" &&
              `${
                cardHp !== "" ? " | " : ""
              }Retreat Cost: ${cardConvertedRetreatCostOperator} ${cardConvertedRetreatCost}`}
          </ThemedText>
        </ThemedView>
      )}
      {/* Evolution summary before reset button */}
      {(cardStage.length > 0 || cardEvolvesFrom || cardEvolvesTo) && (
        <ThemedView style={{ marginBottom: 8 }}>
          <ThemedText type="default">
            {cardStage.length > 0 && `Stage: ${cardStage.join(", ")}`}
            {cardEvolvesFrom && `${cardStage.length > 0 ? " | " : ""}Evolves From: ${cardEvolvesFrom}`}
            {cardEvolvesTo && `${cardStage.length > 0 || cardEvolvesFrom ? " | " : ""}Evolves To: ${cardEvolvesTo}`}
          </ThemedText>
        </ThemedView>
      )}
      {/* Weaknesses/Resistances summary before reset button */}
      {(cardWeaknessesType.length > 0 || cardResistancesType.length > 0) && (
        <ThemedView style={{ marginBottom: 8 }}>
          <ThemedText type="default">
            {cardWeaknessesType.length > 0 && `Weaknesses: ${cardWeaknessesType.join(", ")}`}
            {cardResistancesType.length > 0 &&
              `${cardWeaknessesType.length > 0 ? " | " : ""}Resistances: ${cardResistancesType.join(", ")}`}
          </ThemedText>
        </ThemedView>
      )}
      {/* Edition summary before reset button */}
      {(cardRegulationMark.length > 0 || cardSetName.length > 0 || cardNumber !== "" || cardSetNumber) && (
        <ThemedView style={{ marginBottom: 8 }}>
          <ThemedText type="default">
            {cardRegulationMark.length > 0 && `Regulation Mark: ${cardRegulationMark.join(", ")}`}
            {cardSetName.length > 0 &&
              `${cardRegulationMark.length > 0 ? " | " : ""}Set Name: ${cardSetName.join(", ")}`}
            {cardNumber !== "" &&
              `${cardRegulationMark.length > 0 || cardSetName.length > 0 ? " | " : ""}Card Number: ${cardNumber}`}
            {cardSetNumber &&
              `${
                cardRegulationMark.length > 0 || cardSetName.length > 0 || cardNumber !== "" ? " | " : ""
              }Card/Set Number: ${cardSetNumber}`}
          </ThemedText>
        </ThemedView>
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
