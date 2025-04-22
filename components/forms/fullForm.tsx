import React, { useState, useEffect } from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import TextInput from "@/components/base/TextInput";
import NumberInput from "@/components/base/NumberInput";
import Collapsible from "@/components/base/Collapsible";
import { supabase } from "@/lib/supabase";
import ThemedText from "@/components/base/ThemedText";

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
  const [cardTypes, setCardTypes] = useState<string[]>([]);
  const [cardEvolvesFrom, setCardEvolvesFrom] = useState("");
  const [cardEvolvesTo, setCardEvolvesTo] = useState("");
  const [cardRules, setCardRules] = useState("");
  const [abilitiesName, setAbilitiesName] = useState("");
  const [abilitiesText, setAbilitiesText] = useState("");
  const [attacksName, setAttacksName] = useState("");
  const [attacksDamage, setAttacksDamage] = useState<number | "">("");
  const [attacksText, setAttacksText] = useState("");
  const [attacksCost, setAttacksCost] = useState<string[]>([]);
  const [attacksConvertedEnergyCost, setAttacksConvertedEnergyCost] = useState<number | "">("");
  const [cardWeaknessesType, setCardWeaknessesType] = useState<string[]>([]);
  const [cardResistancesType, setCardResistancesType] = useState<string[]>([]);
  const [cardConvertedRetreatCost, setCardConvertedRetreatCost] = useState<number | "">("");
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
    setCardTypes([]);
    setCardEvolvesFrom("");
    setCardEvolvesTo("");
    setCardRules("");
    setAbilitiesName("");
    setAbilitiesText("");
    setAttacksName("");
    setAttacksDamage("");
    setAttacksText("");
    setAttacksCost([]);
    setAttacksConvertedEnergyCost("");
    setCardWeaknessesType([]);
    setCardResistancesType([]);
    setCardConvertedRetreatCost("");
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

  const handleSubmit = async () => {
    if (setLoadingProp) setLoadingProp(true);
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
            onChange={setAttacksDamage}
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
            onChange={setAttacksConvertedEnergyCost}
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
            onChange={setCardHp}
            placeholder="Card HP"
            showOperatorSelect={"basic"}
          />
          <NumberInput
            label="Card Converted Retreat Cost"
            value={cardConvertedRetreatCost}
            onChange={setCardConvertedRetreatCost}
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
