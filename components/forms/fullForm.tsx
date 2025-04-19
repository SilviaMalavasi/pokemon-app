import React, { useState } from "react";
import ThemedView from "@/components/base/ThemedView";
import { ThemedButton } from "@/components/base/ThemedButton";
import DynamicMultiSelect from "@/components/base/DynamicMultiSelect";
import TextInput from "@/components/base/TextInput";
import NumberInput from "@/components/base/NumberInput";
import uniqueIdentifiers from "@/assets/db/uniqueIdentifiers.json";

const cardSupertypeOptions = uniqueIdentifiers.cardSupertype.map((v: string) => ({ value: v, label: v }));
const cardStageOptions = uniqueIdentifiers.cardStagePokémon.map((v: string) => ({ value: v, label: v }));
const cardTypesOptions = uniqueIdentifiers.cardTypes.map((v: string) => ({ value: v, label: v }));
const cardRegulationMarkOptions = uniqueIdentifiers.cardRegulationMark.map((v: string) => ({ value: v, label: v }));
const cardSetNamesOptions = uniqueIdentifiers.cardSetNames.map((v: string) => ({ value: v, label: v }));

const getCardSubtypesOptions = (supertype: string) => {
  if (!supertype) {
    return uniqueIdentifiers.cardSubtypes.map((v: string) => ({ value: v, label: v }));
  }
  if (supertype === "Pokémon" && uniqueIdentifiers.cardSubtypePokémon) {
    return uniqueIdentifiers.cardSubtypePokémon.map((v: string) => ({ value: v, label: v }));
  }
  if (supertype === "Trainer" && uniqueIdentifiers.cardSubtypeTrainer) {
    return uniqueIdentifiers.cardSubtypeTrainer.map((v: string) => ({ value: v, label: v }));
  }
  if (supertype === "Energy" && uniqueIdentifiers.cardSubtypeEnergy) {
    return uniqueIdentifiers.cardSubtypeEnergy.map((v: string) => ({ value: v, label: v }));
  }
  return uniqueIdentifiers.cardSubtypes.map((v: string) => ({ value: v, label: v }));
};

export default function FullForm(): JSX.Element {
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
  const [attacksDamage, setAttacksDamage] = useState("");
  const [attacksText, setAttacksText] = useState("");
  const [attacksCost, setAttacksCost] = useState<string[]>([]);
  const [attacksConvertedEnergyCost, setAttacksConvertedEnergyCost] = useState<number | "">("");
  const [cardWeaknessesType, setCardWeaknessesType] = useState<string[]>([]);
  const [cardWeaknessesValue, setCardWeaknessesValue] = useState<number | "">("");
  const [cardResistancesType, setCardResistancesType] = useState<string[]>([]);
  const [cardResistancesValue, setCardResistancesValue] = useState<number | "">("");
  const [cardConvertedRetreatCost, setCardConvertedRetreatCost] = useState<number | "">("");
  const [cardArtist, setCardArtist] = useState("");
  const [cardFlavor, setCardFlavor] = useState("");
  const [cardRegulationMark, setCardRegulationMark] = useState<string[]>([]);
  const [cardSetName, setCardSetName] = useState<string[]>([]);
  const [cardNumber, setCardNumber] = useState<number | "">("");
  const [cardStage, setCardStage] = useState<string[]>([]);

  const handleSubmit = () => {
    // Collect all filter values
    const filters = {
      cardSupertype,
      cardSubtypes,
      cardName,
      cardHp,
      cardTypes,
      cardEvolvesFrom,
      cardEvolvesTo,
      cardRules,
      abilitiesName,
      abilitiesText,
      attacksName,
      attacksDamage,
      attacksText,
      attacksCost,
      attacksConvertedEnergyCost,
      cardWeaknessesType,
      cardWeaknessesValue,
      cardResistancesType,
      cardResistancesValue,
      cardConvertedRetreatCost,
      cardArtist,
      cardFlavor,
      cardRegulationMark,
      cardSetName,
      cardNumber,
      cardStage,
    };
    console.log(filters);
  };

  const selectedSupertype = cardSupertype[0];
  const cardSubtypesOptions = getCardSubtypesOptions(selectedSupertype);

  return (
    <ThemedView>
      <DynamicMultiSelect
        label="Supertype"
        value={cardSupertype}
        options={cardSupertypeOptions}
        onChange={setCardSupertype}
      />
      <DynamicMultiSelect
        label="Subtypes"
        value={cardSubtypes}
        options={cardSubtypesOptions}
        onChange={setCardSubtypes}
      />
      {selectedSupertype === "Pokémon" && (
        <DynamicMultiSelect
          label="Stage"
          value={cardStage}
          options={cardStageOptions}
          onChange={setCardStage}
        />
      )}
      <TextInput
        label="Name"
        value={cardName}
        onChange={setCardName}
        placeholder="Card name"
      />
      {selectedSupertype === "Pokémon" && (
        <NumberInput
          label="HP"
          value={cardHp}
          onChange={setCardHp}
          placeholder="Card HP"
        />
      )}
      {(selectedSupertype === "Pokémon" || selectedSupertype === "Energy") && (
        <DynamicMultiSelect
          label="Types"
          value={cardTypes}
          options={cardTypesOptions}
          onChange={setCardTypes}
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <TextInput
          label="Evolves From"
          value={cardEvolvesFrom}
          onChange={setCardEvolvesFrom}
          placeholder="Evolves from"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <TextInput
          label="Evolves To"
          value={cardEvolvesTo}
          onChange={setCardEvolvesTo}
          placeholder="Evolves to"
        />
      )}
      <TextInput
        label="Rules"
        value={cardRules}
        onChange={setCardRules}
        placeholder="Rules"
      />
      {selectedSupertype === "Pokémon" && (
        <TextInput
          label="Abilities Name"
          value={abilitiesName}
          onChange={setAbilitiesName}
          placeholder="Ability name"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <TextInput
          label="Abilities Text"
          value={abilitiesText}
          onChange={setAbilitiesText}
          placeholder="Ability text"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <TextInput
          label="Attacks Name"
          value={attacksName}
          onChange={setAttacksName}
          placeholder="Attack name"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <TextInput
          label="Attacks Damage"
          value={attacksDamage}
          onChange={setAttacksDamage}
          placeholder="Attack damage"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <TextInput
          label="Attacks Text"
          value={attacksText}
          onChange={setAttacksText}
          placeholder="Attack text"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <DynamicMultiSelect
          label="Attacks Cost"
          value={attacksCost}
          options={cardTypesOptions}
          onChange={setAttacksCost}
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <NumberInput
          label="Attacks Converted Energy Cost"
          value={attacksConvertedEnergyCost}
          onChange={setAttacksConvertedEnergyCost}
          placeholder="Converted energy cost"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <DynamicMultiSelect
          label="Weaknesses Type"
          value={cardWeaknessesType}
          options={cardTypesOptions}
          onChange={setCardWeaknessesType}
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <NumberInput
          label="Weaknesses Value"
          value={cardWeaknessesValue}
          onChange={setCardWeaknessesValue}
          placeholder="Weakness value"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <DynamicMultiSelect
          label="Resistances Type"
          value={cardResistancesType}
          options={cardTypesOptions}
          onChange={setCardResistancesType}
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <NumberInput
          label="Resistances Value"
          value={cardResistancesValue}
          onChange={setCardResistancesValue}
          placeholder="Resistance value"
        />
      )}
      {selectedSupertype === "Pokémon" && (
        <NumberInput
          label="Converted Retreat Cost"
          value={cardConvertedRetreatCost}
          onChange={setCardConvertedRetreatCost}
          placeholder="Converted retreat cost"
        />
      )}
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
      <DynamicMultiSelect
        label="Regulation Mark"
        value={cardRegulationMark}
        options={cardRegulationMarkOptions}
        onChange={setCardRegulationMark}
      />
      <DynamicMultiSelect
        label="Set Name"
        value={cardSetName}
        options={cardSetNamesOptions}
        onChange={setCardSetName}
      />
      <NumberInput
        label="Card Number"
        value={cardNumber}
        onChange={setCardNumber}
        placeholder="Card number"
      />
      <ThemedButton
        title="Search"
        onPress={handleSubmit}
      />
    </ThemedView>
  );
}
