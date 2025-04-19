import React, { useState } from "react";
import DynamicMultiSelect from "../formInputs/DynamicMultiSelect";
import TextInput from "../formInputs/TextInput";
import NumberInput from "../formInputs/NumberInput";
import uniqueIdentifiers from "../../assets/db/uniqueIdentifiers.json";

const cardSupertypeOptions = uniqueIdentifiers.cardSupertype.map((v: string) => ({ value: v, label: v }));
const cardSubtypesOptions = uniqueIdentifiers.cardSubtypes.map((v: string) => ({ value: v, label: v }));
const cardTypesOptions = uniqueIdentifiers.cardTypes.map((v: string) => ({ value: v, label: v }));
const cardRegulationMarkOptions = uniqueIdentifiers.cardRegulationMark.map((v: string) => ({ value: v, label: v }));
const cardSetNamesOptions = uniqueIdentifiers.cardSetNames.map((v: string) => ({ value: v, label: v }));

const FullForm: React.FC = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    };
    console.log(filters);
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <TextInput
        label="Name"
        value={cardName}
        onChange={setCardName}
        placeholder="Card name"
      />
      <NumberInput
        label="HP"
        value={cardHp}
        onChange={setCardHp}
        placeholder="Card HP"
      />
      <DynamicMultiSelect
        label="Types"
        value={cardTypes}
        options={cardTypesOptions}
        onChange={setCardTypes}
      />
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
      <TextInput
        label="Rules"
        value={cardRules}
        onChange={setCardRules}
        placeholder="Rules"
      />
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
      <TextInput
        label="Attacks Name"
        value={attacksName}
        onChange={setAttacksName}
        placeholder="Attack name"
      />
      <TextInput
        label="Attacks Damage"
        value={attacksDamage}
        onChange={setAttacksDamage}
        placeholder="Attack damage"
      />
      <TextInput
        label="Attacks Text"
        value={attacksText}
        onChange={setAttacksText}
        placeholder="Attack text"
      />
      <DynamicMultiSelect
        label="Attacks Cost"
        value={attacksCost}
        options={cardTypesOptions}
        onChange={setAttacksCost}
      />
      <NumberInput
        label="Attacks Converted Energy Cost"
        value={attacksConvertedEnergyCost}
        onChange={setAttacksConvertedEnergyCost}
        placeholder="Converted energy cost"
      />
      <DynamicMultiSelect
        label="Weaknesses Type"
        value={cardWeaknessesType}
        options={cardTypesOptions}
        onChange={setCardWeaknessesType}
      />
      <NumberInput
        label="Weaknesses Value"
        value={cardWeaknessesValue}
        onChange={setCardWeaknessesValue}
        placeholder="Weakness value"
      />
      <DynamicMultiSelect
        label="Resistances Type"
        value={cardResistancesType}
        options={cardTypesOptions}
        onChange={setCardResistancesType}
      />
      <NumberInput
        label="Resistances Value"
        value={cardResistancesValue}
        onChange={setCardResistancesValue}
        placeholder="Resistance value"
      />
      <NumberInput
        label="Converted Retreat Cost"
        value={cardConvertedRetreatCost}
        onChange={setCardConvertedRetreatCost}
        placeholder="Converted retreat cost"
      />
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
      <button type="submit">Search</button>
    </form>
  );
};

export default FullForm;
