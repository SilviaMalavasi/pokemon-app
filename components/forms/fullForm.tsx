import React, { useState, useEffect } from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import TextInput from "@/components/base/TextInput";
import NumberInput from "@/components/base/NumberInput";
import Collapsible from "@/components/base/Collapsible";
import { queryBuilder } from "@/helpers/queryBuilder";
import type { QueryBuilderFilter } from "@/helpers/queryBuilder";
import ThemedText from "@/components/base/ThemedText";
import { supabase } from "@/lib/supabase";

import uniqueIdentifiers from "@/assets/uniqueIdentifiers.json";

const cardSupertypeOptions = uniqueIdentifiers.cardSupertype.map((v: string) => ({ value: v, label: v }));
const cardStageOptions = uniqueIdentifiers.cardStagePokémon.map((v: string) => ({ value: v, label: v }));
const cardTypesOptions = uniqueIdentifiers.cardTypes.map((v: string) => ({ value: v, label: v }));
const cardRegulationMarkOptions = uniqueIdentifiers.cardRegulationMark.map((v: string) => ({ value: v, label: v }));
const cardSetNamesOptions = uniqueIdentifiers.cardSetNames.map((v: string) => ({ value: v, label: v }));

const getCardSubtypesOptions = (supertypes: string[]) => {
  if (!supertypes || supertypes.length === 0) {
    return uniqueIdentifiers.cardSubtypes.map((v: string) => ({ value: v, label: v }));
  }
  let subtypeSet = new Set<string>();
  supertypes.forEach((supertype) => {
    if (supertype === "Pokémon" && uniqueIdentifiers.cardSubtypePokémon) {
      uniqueIdentifiers.cardSubtypePokémon.forEach((v: string) => subtypeSet.add(v));
    } else if (supertype === "Trainer" && uniqueIdentifiers.cardSubtypeTrainer) {
      uniqueIdentifiers.cardSubtypeTrainer.forEach((v: string) => subtypeSet.add(v));
    } else if (supertype === "Energy" && uniqueIdentifiers.cardSubtypeEnergy) {
      uniqueIdentifiers.cardSubtypeEnergy.forEach((v: string) => subtypeSet.add(v));
    }
  });
  // If no known supertype, fallback to all subtypes
  if (subtypeSet.size === 0) {
    uniqueIdentifiers.cardSubtypes.forEach((v: string) => subtypeSet.add(v));
  }
  return Array.from(subtypeSet).map((v) => ({ value: v, label: v }));
};

export default function FullForm({
  onSearchResults,
  setLoading: setLoadingProp,
  resetKey,
}: {
  onSearchResults?: (ids: string[], query: string) => void;
  setLoading?: (loading: boolean) => void;
  resetKey?: number;
} = {}): JSX.Element {
  // State for all fields
  const [cardSupertype, setCardSupertype] = useState<string[]>([]);
  const [cardSubtypes, setCardSubtypes] = useState<string[]>([]);
  const [cardName, setCardName] = useState("");
  const [cardHp, setCardHp] = useState<number | "">("");
  const [cardHpOperator, setCardHpOperator] = useState("=");
  const [cardTypes, setCardTypes] = useState<string[]>([]);
  const [cardEvolvesFrom, setCardEvolvesFrom] = useState("");
  const [cardEvolvesTo, setCardEvolvesTo] = useState("");
  const [cardRules, setCardRules] = useState("");
  const [abilitiesName, setAbilitiesName] = useState("");
  const [abilitiesText, setAbilitiesText] = useState("");
  const [attacksName, setAttacksName] = useState("");
  const [attacksDamage, setAttacksDamage] = useState<number | "">("");
  const [attacksDamageOperator, setAttacksDamageOperator] = useState("=");
  const [attacksText, setAttacksText] = useState("");
  const [attacksCost, setAttacksCost] = useState<string[]>([]);
  const [attacksConvertedEnergyCost, setAttacksConvertedEnergyCost] = useState<number | "">("");
  const [attacksConvertedEnergyCostOperator, setAttacksConvertedEnergyCostOperator] = useState("=");
  const [cardWeaknessesType, setCardWeaknessesType] = useState<string[]>([]);
  const [cardResistancesType, setCardResistancesType] = useState<string[]>([]);
  const [cardConvertedRetreatCost, setCardConvertedRetreatCost] = useState<number | "">("");
  const [cardConvertedRetreatCostOperator, setCardConvertedRetreatCostOperator] = useState("=");
  const [cardArtist, setCardArtist] = useState("");
  const [cardFlavor, setCardFlavor] = useState("");
  const [cardRegulationMark, setCardRegulationMark] = useState<string[]>([]);
  const [cardSetName, setCardSetName] = useState<string[]>([]);
  const [cardNumber, setCardNumber] = useState<number | "">("");
  const [cardStage, setCardStage] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
    setCardIds([]);
    setSearchQuery("");
    setError(null);
  }, [resetKey]);

  // Reset subtypes when supertype changes
  useEffect(() => {
    setCardSubtypes([]);
  }, [cardSupertype]);

  const handleSubmit = async (): Promise<void> => {
    if (setLoadingProp) setLoadingProp(true);
    setLoading(true);
    setError(null);

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
        config: { key: "cardSubtypes", type: "multiselect", table: "Card", column: "subtypes" },
        value: cardSubtypes,
      },
      cardTypes.length > 0 && {
        config: { key: "cardTypes", type: "multiselect", table: "Card", column: "types" },
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
        config: { key: "attackDamage", type: "number", table: "Attacks", column: "damage", valueType: "text" },
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
      cardStage.length > 0 && {
        config: { key: "stage", type: "multiselect", table: "Card", column: "subtypes" },
        value: cardStage,
      },
      cardEvolvesFrom && {
        config: { key: "evolvesFrom", type: "text", table: "Card", column: "evolvesFrom" },
        value: cardEvolvesFrom,
      },
      cardEvolvesTo && {
        config: { key: "evolvesTo", type: "text", table: "Card", column: "evolvesTo" },
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
        config: { key: "weaknesses", type: "multiselect", table: "Card", column: "weaknesses" },
        value: cardWeaknessesType,
      },
      cardResistancesType.length > 0 && {
        config: { key: "resistances", type: "multiselect", table: "Card", column: "resistances" },
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
    ].filter(Boolean) as QueryBuilderFilter[];
    try {
      const { cardIds, query } = await queryBuilder(filters);
      setCardIds(cardIds);
      setSearchQuery(query);
      if (onSearchResults) onSearchResults(cardIds, query);

      // Fetch and log card names for the returned cardIds
      if (cardIds.length > 0) {
        const { data, error } = await supabase.from("Card").select("cardId, name").in("cardId", cardIds);
        if (error) {
          console.error("Error fetching card names:", error.message);
        } else {
          console.clear();
          console.log("QueryBuilder input filters:", filters);
          console.log("QueryBuilder built query:", query);
          console.log("Results:");
          data?.forEach((row: { cardId: string; name: string }) => {
            console.log(`cardId: ${row.cardId}, name: ${row.name}`);
          });
        }
      } else {
        console.clear();
        console.log("No cardIds found.");
      }
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
      if (setLoadingProp) setLoadingProp(false);
    }
  };

  const cardSubtypesOptions = getCardSubtypesOptions(cardSupertype);

  return (
    <ThemedView>
      <TextInput
        label="Name"
        value={cardName}
        onChange={setCardName}
        placeholder="Card name"
      />
      <Collapsible
        title="Card Type"
        resetKey={resetKey}
      >
        <DynamicMultiSelect
          label="Supertype"
          value={cardSupertype}
          options={cardSupertypeOptions}
          onChange={setCardSupertype}
          labelHint="Include cards that match ANY of the selected choices."
        />
        <DynamicMultiSelect
          label="Subtypes"
          value={cardSubtypes}
          options={cardSubtypesOptions}
          onChange={setCardSubtypes}
          labelHint="Include cards that match ANY of the selected choices."
        />
        {cardSupertype[0] !== "Trainer" && (
          <DynamicMultiSelect
            label="Types"
            value={cardTypes}
            options={cardTypesOptions}
            onChange={setCardTypes}
            labelHint="Include cards that match ANY of the selected choices."
          />
        )}
      </Collapsible>
      <Collapsible
        title="Card Rules"
        resetKey={resetKey}
      >
        <TextInput
          label="Rules"
          value={cardRules}
          onChange={setCardRules}
          placeholder="Card rules"
          labelHint="Rules refers to Pokémon special rules (es Pokémon-EX rules) or Trainer card rules."
        />
      </Collapsible>
      {cardSupertype[0] !== "Energy" && cardSupertype[0] !== "Trainer" && (
        <Collapsible
          title="Attacks"
          resetKey={resetKey}
        >
          <TextInput
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

          <TextInput
            label="Attack Text"
            value={attacksText}
            onChange={setAttacksText}
            placeholder="Attack text"
          />

          <DynamicMultiSelect
            label="Attack Cost"
            value={attacksCost}
            options={cardTypesOptions}
            onChange={setAttacksCost}
            labelHint="Include cards that match ANY of the selected choices."
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
        </Collapsible>
      )}
      {cardSupertype[0] !== "Energy" && cardSupertype[0] !== "Trainer" && (
        <Collapsible
          title="Abilities"
          resetKey={resetKey}
        >
          <TextInput
            label="Abilities Name"
            value={abilitiesName}
            onChange={setAbilitiesName}
            placeholder="Ability name"
          />
          <TextInput
            label="Abilities Text"
            value={abilitiesText}
            onChange={setAbilitiesText}
            placeholder="Ability text"
          />
        </Collapsible>
      )}
      {cardSupertype[0] !== "Energy" && cardSupertype[0] !== "Trainer" && (
        <Collapsible
          title="Evolution"
          resetKey={resetKey}
        >
          {cardSupertype[0] !== "Energy" && cardSupertype[0] !== "Trainer" && (
            <DynamicMultiSelect
              label="Stage"
              value={cardStage}
              options={cardStageOptions}
              onChange={setCardStage}
              labelHint="Include cards that match ANY of the selected choices."
            />
          )}
          <TextInput
            label="Evolves From"
            value={cardEvolvesFrom}
            onChange={setCardEvolvesFrom}
            placeholder="Evolves from"
          />
          <TextInput
            label="Evolves To"
            value={cardEvolvesTo}
            onChange={setCardEvolvesTo}
            placeholder="Evolves to"
          />
        </Collapsible>
      )}
      {cardSupertype[0] !== "Energy" && cardSupertype[0] !== "Trainer" && (
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
      {cardSupertype[0] !== "Energy" && cardSupertype[0] !== "Trainer" && (
        <Collapsible
          title="Weaknesses/Resistances"
          resetKey={resetKey}
        >
          <DynamicMultiSelect
            label="Weaknesses Type"
            value={cardWeaknessesType}
            options={cardTypesOptions}
            onChange={setCardWeaknessesType}
            labelHint="Include cards that match ANY of the selected choices."
          />
          <DynamicMultiSelect
            label="Resistances Type"
            value={cardResistancesType}
            options={cardTypesOptions}
            onChange={setCardResistancesType}
            labelHint="Include cards that match ANY of the selected choices."
          />
        </Collapsible>
      )}
      <Collapsible
        title="Artist/Flavor"
        resetKey={resetKey}
      >
        <TextInput
          label="Artist"
          value={cardArtist}
          onChange={setCardArtist}
          placeholder="Artist"
        />
        <TextInput
          label="Flavor"
          value={cardFlavor}
          onChange={setCardFlavor}
          placeholder="Flavor text"
        />
      </Collapsible>
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
      </Collapsible>
      <ThemedButton
        title="Search"
        onPress={handleSubmit}
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
