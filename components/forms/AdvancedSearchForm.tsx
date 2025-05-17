import React, { useState, useEffect } from "react";

import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ThemedText from "@/components/base/ThemedText";
import ThemedSwitch from "@/components/base/ThemedSwitch";
import ThemedButton from "@/components/base/ThemedButton";
import ThemedTextInput from "@/components/base/ThemedTextInput";
import ThemedView from "@/components/ui/ThemedView";

import { useSearchFormContext } from "@/components/context/SearchFormContext";
import { queryBuilder } from "@/helpers/queryBuilder";
import type { QueryBuilderFilter } from "@/helpers/queryBuilder";
import { useCardDatabase } from "@/components/context/CardDatabaseContext";

import CardTypeModal, { getCardTypeFilters } from "@/components/forms/modals/CardTypeModal";
import RulesModal, { getRulesFilters } from "@/components/forms/modals/RulesModal";
import AttacksModal, { getAttacksFilters } from "@/components/forms/modals/AttacksModal";
import AbilitiesModal, { getAbilitiesFilters } from "@/components/forms/modals/AbilitiesModal";
import StatsModal, { getStatsFilters } from "@/components/forms/modals/StatsModal";
import EvolutionModal, { getEvolutionFilters } from "@/components/forms/modals/EvolutionModal";
import WeakResModal, { getWeakResFilters } from "@/components/forms/modals/WeakResModal";
import EditionModal, { getEditionFilters } from "@/components/forms/modals/EditionModal";

import styles from "@/style/forms/AdvancedSearchFormStyle";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

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
}) {
  const { db, isLoading, isUpdating } = useCardDatabase();
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

  // Local state
  const [loading, setLoading] = useState(false);
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
    clearAdvancedForm();
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
  }, [resetKey]);

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

  // Check if any filter is set
  const isAnyFilterSet =
    cardName.trim() !== "" ||
    cardSupertype.length > 0 ||
    cardSubtypes.length > 0 ||
    cardTypes.length > 0 ||
    cardRules.trim() !== "" ||
    attacksName.trim() !== "" ||
    attacksDamage !== "" ||
    attacksText.trim() !== "" ||
    attacksCost.length > 0 ||
    attacksConvertedEnergyCost !== "" ||
    (attacksCostSlots && attacksCostSlots.some((v) => v)) ||
    abilitiesName.trim() !== "" ||
    abilitiesText.trim() !== "" ||
    hasAnyAbility ||
    cardHp !== "" ||
    cardConvertedRetreatCost !== "" ||
    cardStage.length > 0 ||
    cardEvolvesFrom.trim() !== "" ||
    cardEvolvesTo.trim() !== "" ||
    cardWeaknessesType.length > 0 ||
    cardResistancesType.length > 0 ||
    cardArtist.trim() !== "" ||
    cardFlavor.trim() !== "" ||
    cardRegulationMark.length > 0 ||
    cardSetName.length > 0 ||
    cardNumber !== "" ||
    cardSetNumber.trim() !== "";

  const handleSubmit = async (): Promise<void> => {
    if (!db || isLoading || isUpdating) {
      setLoading(false);
      if (setLoadingProp) setLoadingProp(false);
      return;
    }
    if (setLoadingProp) setLoadingProp(true);
    setLoading(true);
    saveFormToContext();

    // Build filters array using modal filter functions
    const filters = [
      cardName && {
        config: { key: "cardName", type: "text", table: "Card", column: "name" },
        value: cardName,
      },
      ...getCardTypeFilters(cardSupertype, cardSubtypes, cardTypes),
      ...getAttacksFilters(
        attacksName,
        attacksDamage,
        attacksDamageOperator,
        attacksText,
        attacksCost,
        attacksConvertedEnergyCost,
        attacksConvertedEnergyCostOperator,
        attacksCostSlots
      ),
      ...getAbilitiesFilters(abilitiesName, abilitiesText, hasAnyAbility),
      ...getStatsFilters(cardHp, cardHpOperator, cardConvertedRetreatCost, cardConvertedRetreatCostOperator),
      ...getEvolutionFilters(cardStage, cardEvolvesFrom, cardEvolvesTo),
      ...getWeakResFilters(cardWeaknessesType, cardResistancesType),
      ...getEditionFilters(cardRegulationMark, cardSetName, cardNumber, cardSetNumber),
      ...getRulesFilters(cardRules),
    ].filter(Boolean) as QueryBuilderFilter[];

    if (!db) {
      // Add a check for db instance
      console.error("Database context not available!");
      setLoading(false);
      if (setLoadingProp) setLoadingProp(false);
      return;
    }

    try {
      const { cardIds, query } = await queryBuilder(db, filters);

      if (onSearchResults) onSearchResults(cardIds, query);

      // Fetch and log card names for the returned cardIds (only for paginated IDs)
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const paginatedIds = cardIds.slice(startIdx, endIdx);
      if (paginatedIds.length > 0) {
        // Use SQLite db instance to fetch names
        const placeholders = paginatedIds.map(() => "?").join(", ");
        const nameData = await db.getAllAsync<{ cardId: string; name: string }>(
          `SELECT cardId, name FROM Card WHERE cardId IN (${placeholders})`,
          paginatedIds
        );
      }
    } catch (err: any) {
      console.error("Error during handleSubmit:", err); // Log error
    } finally {
      setLoading(false);
      if (setLoadingProp) setLoadingProp(false);
    }
  };

  // Helper to interleave a separator component between array items
  const interleaveWithOr = (arr: string[]) => {
    const filtered = arr.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <Text style={styles.summaryArrayText}>
        {filtered.map((item, idx) => (
          <React.Fragment key={item + idx}>
            {idx > 0 && <Text style={styles.summaryArrayTextSeparator}>{"  OR  "}</Text>}
            <Text>{item}</Text>
          </React.Fragment>
        ))}
      </Text>
    );
  };

  // Helper to interleave with AND (for attack cost slots)
  const interleaveWithAnd = (arr: string[]) => {
    const filtered = arr.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <Text style={styles.summaryArrayText}>
        {filtered.map((item, idx) => (
          <React.Fragment key={item + idx}>
            {idx > 0 && <Text style={styles.summaryArrayTextSeparator}>{"  AND  "}</Text>}
            <Text>{item}</Text>
          </React.Fragment>
        ))}
      </Text>
    );
  };

  // Summary fields for flat summary
  const summaryFields = [
    { label: "Name", value: cardName },
    { label: "Type", value: cardSupertype.length ? interleaveWithOr(cardSupertype) : "" },
    { label: "Label", value: cardSubtypes.length ? interleaveWithOr(cardSubtypes) : "" },
    { label: "Energy Type", value: cardTypes.length ? interleaveWithOr(cardTypes) : "" },
    { label: "Rule/Rule Box", value: cardRules },
    { label: "Attack Name", value: attacksName },
    { label: "Attack Damage", value: attacksDamage !== "" ? `${attacksDamageOperator} ${attacksDamage}` : "" },
    { label: "Attack Text", value: attacksText },
    {
      label: "Attack Cost",
      value:
        attacksConvertedEnergyCost !== "" ? `${attacksConvertedEnergyCostOperator} ${attacksConvertedEnergyCost}` : "",
    },
    { label: "Attack Energy Type", value: attacksCost.length ? interleaveWithOr(attacksCost) : "" },
    {
      label: "AttackEnergy Type for Slots",
      value: attacksCostSlots.filter(Boolean).length ? interleaveWithAnd(attacksCostSlots.filter(Boolean)) : "",
    },
    { label: "Ability Name", value: abilitiesName },
    { label: "Ability Text", value: abilitiesText },
    { label: "Has any ability", value: hasAnyAbility ? "Yes" : "" },
    { label: "Pokémon HP", value: cardHp !== "" ? `${cardHpOperator} ${cardHp}` : "" },
    {
      label: "Retreat Cost",
      value: cardConvertedRetreatCost !== "" ? `${cardConvertedRetreatCostOperator} ${cardConvertedRetreatCost}` : "",
    },
    { label: "Stage", value: cardStage.length ? interleaveWithOr(cardStage) : "" },
    { label: "Evolves From", value: cardEvolvesFrom },
    { label: "Evolves To", value: cardEvolvesTo },
    { label: "Weaknesses", value: cardWeaknessesType.length ? interleaveWithOr(cardWeaknessesType) : "" },
    { label: "Resistances", value: cardResistancesType.length ? interleaveWithOr(cardResistancesType) : "" },
    { label: "Artist", value: cardArtist },
    { label: "Flavor", value: cardFlavor },
    { label: "Regulation Mark", value: cardRegulationMark.length ? interleaveWithOr(cardRegulationMark) : "" },
    { label: "Set Name", value: cardSetName.length ? interleaveWithOr(cardSetName) : "" },
    { label: "Card Number", value: cardNumber },
    { label: "Pokédex Number", value: cardSetNumber },
  ];

  return (
    <View>
      <ThemedView style={{ marginBottom: theme.padding.large * -1 }}>
        <ThemedTextInput
          value={cardName}
          onChange={setCardName}
          placeholder="Card name"
          style={{ marginBottom: theme.padding.large }}
        />
        <View style={styles.buttonRow}>
          <ThemedButton
            type="outline"
            size="small"
            disabled={false}
            status={cardSupertype.length > 0 || cardSubtypes.length > 0 || cardTypes.length > 0 ? "active" : "default"}
            title="Card Type"
            onPress={() => setCardTypeModalVisible(true)}
            style={styles.halfButton}
          />
          <ThemedButton
            type="outline"
            size="small"
            disabled={false}
            status={cardRules ? "active" : "default"}
            title="Rules"
            onPress={() => setRulesModalVisible(true)}
            style={styles.halfButton}
          />
        </View>
        <View style={styles.buttonRow}>
          <ThemedButton
            type="outline"
            size="small"
            disabled={false}
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
            title="Attacks"
            onPress={() => setAttacksModalVisible(true)}
            style={styles.halfButton}
          />
          <ThemedButton
            type="outline"
            size="small"
            disabled={false}
            status={abilitiesName || abilitiesText || hasAnyAbility ? "active" : "default"}
            title="Abilities"
            onPress={() => setAbilitiesModalVisible(true)}
            style={styles.halfButton}
          />
        </View>
        <View style={styles.buttonRow}>
          <ThemedButton
            type="outline"
            size="small"
            disabled={false}
            status={cardHp !== "" || cardConvertedRetreatCost !== "" ? "active" : "default"}
            title="Stats"
            onPress={() => setStatsModalVisible(true)}
            style={styles.halfButton}
          />
          <ThemedButton
            type="outline"
            size="small"
            disabled={false}
            status={cardStage.length > 0 || cardEvolvesFrom || cardEvolvesTo ? "active" : "default"}
            title="Evolution"
            onPress={() => setEvolutionModalVisible(true)}
            style={styles.halfButton}
          />
        </View>
        <View style={styles.buttonRow}>
          <ThemedButton
            type="outline"
            size="small"
            disabled={false}
            status={cardWeaknessesType.length > 0 || cardResistancesType.length > 0 ? "active" : "default"}
            title="Weak/Res"
            onPress={() => setWeakResModalVisible(true)}
            style={styles.halfButton}
          />
          <ThemedButton
            type="outline"
            size="small"
            disabled={false}
            status={
              cardRegulationMark.length > 0 || cardSetName.length > 0 || cardNumber !== "" || cardSetNumber
                ? "active"
                : "default"
            }
            title="Edition"
            onPress={() => setEditionModalVisible(true)}
            style={styles.halfButton}
          />
        </View>
        <ThemedSwitch
          value={removeDuplicates}
          label="Hide duplicates"
          onValueChange={onRemoveDuplicatesChange}
          hint="If enabled, cards with same stats but different images or sets will be displayed only once."
          style={styles.switchContainer}
        />
      </ThemedView>
      <ThemedView
        layout="rounded"
        style={{ paddingHorizontal: theme.padding.medium, position: "relative", zIndex: 2 }}
      >
        <ThemedButton
          title="Reset"
          size="small"
          width={summaryFields.filter((f: { value: any }) => f.value && f.value !== "").length > 0 ? vw(28) : vw(32)}
          type="alternative"
          onPress={handleReset}
        />
        <ThemedButton
          title={"Search"}
          type="main"
          width={vw(42)}
          size="large"
          onPress={handleSubmit}
          status={!isAnyFilterSet || loading ? "disabled" : "default"}
          disabled={!isAnyFilterSet || loading}
        />
      </ThemedView>
      {summaryFields.filter((f) => f.value && f.value !== "").length > 0 && (
        <View>
          <LinearGradient
            colors={[theme.colors.darkGrey, theme.colors.lightGrey]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.4, y: 0.7 }}
            style={styles.summaryContainer}
          >
            <ThemedText
              type="h4"
              style={styles.summaryTitle}
            >
              You are searching for
            </ThemedText>
            <View>
              {summaryFields
                .filter((f) => f.value && f.value !== "")
                .map((f) => {
                  let valueStr = typeof f.value === "string" ? f.value.trim() : null;
                  // Replace ">=" with "≥" and "<=" with "≤" for display
                  if (valueStr && valueStr.startsWith(">=")) valueStr = valueStr.replace(/^>=/, "≥");
                  if (valueStr && valueStr.startsWith("<=")) valueStr = valueStr.replace(/^<=/, "≤");
                  const operatorMatch = valueStr ? valueStr.match(/^(=|≥|≤|>|<|\+|×)\s?/) : null;
                  let operator = "";
                  let restOfValue = valueStr;

                  if (operatorMatch && valueStr) {
                    operator = operatorMatch[0]; // The operator and potential space
                    restOfValue = valueStr.substring(operator.length);
                  }

                  // Special handling for Attack Damage with + or ×
                  const isAttackDamageSpecialCase =
                    f.label === "Attack Damage" && (operator.trim() === "+" || operator.trim() === "×");

                  return (
                    <View
                      style={styles.summaryItemContainer}
                      key={f.label}
                    >
                      <ThemedText>
                        <ThemedText
                          color={theme.colors.white}
                          fontWeight="bold"
                        >
                          {f.label}
                          {/* Adjust separator based on operator type and special case */}
                          {isAttackDamageSpecialCase ? " = " : operator ? " " : ": "}
                        </ThemedText>
                        {/* Show the correct value, string or React element */}
                        {isAttackDamageSpecialCase ? (
                          <>
                            <Text>{restOfValue}</Text>
                            <Text style={{ color: theme.colors.green }}>{operator.trim()}</Text>
                          </>
                        ) : operator ? (
                          <>
                            <Text style={{ color: theme.colors.green }}>{operator}</Text>
                            <Text>{restOfValue}</Text>
                          </>
                        ) : valueStr !== null ? (
                          valueStr
                        ) : (
                          f.value
                        )}
                      </ThemedText>
                    </View>
                  );
                })}
            </View>
          </LinearGradient>
        </View>
      )}

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
      />
      <WeakResModal
        visible={weakResModalVisible}
        onClose={() => setWeakResModalVisible(false)}
        cardWeaknessesType={cardWeaknessesType}
        setCardWeaknessesType={setCardWeaknessesType}
        cardResistancesType={cardResistancesType}
        setCardResistancesType={setCardResistancesType}
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
      />
    </View>
  );
}
