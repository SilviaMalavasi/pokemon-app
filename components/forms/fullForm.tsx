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
    setCardWeaknessesValue("");
    setCardResistancesType([]);
    setCardResistancesValue("");
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
    setError(null);
    setCardIds([]);
    // Trim only leading/trailing spaces for all text fields
    const trimmedCardName = cardName.trim();
    const trimmedCardEvolvesFrom = cardEvolvesFrom.trim();
    const trimmedCardEvolvesTo = cardEvolvesTo.trim();
    const trimmedCardRules = cardRules.trim();
    const trimmedCardArtist = cardArtist.trim();
    const trimmedCardFlavor = cardFlavor.trim();
    const trimmedAbilitiesName = abilitiesName.trim();
    const trimmedAbilitiesText = abilitiesText.trim();
    const trimmedAttacksName = attacksName.trim();
    const trimmedAttacksDamage = attacksDamage.trim();
    const trimmedAttacksText = attacksText.trim();
    // Build filters for Card table
    let cardFilters: any = {};
    if (trimmedCardName) cardFilters.name = trimmedCardName;
    if (cardSupertype.length > 0) cardFilters.supertype = cardSupertype[0];
    if (cardSubtypes.length > 0) cardFilters.subtypes = cardSubtypes.join(",");
    if (cardHp !== "") cardFilters.hp = cardHp;
    if (cardTypes.length > 0) cardFilters.types = cardTypes.join(",");
    if (trimmedCardEvolvesFrom) cardFilters.evolvesFrom = trimmedCardEvolvesFrom;
    if (trimmedCardEvolvesTo) cardFilters.evolvesTo = trimmedCardEvolvesTo;
    if (trimmedCardRules) cardFilters.rules = trimmedCardRules;
    if (cardWeaknessesType.length > 0) cardFilters.weaknesses = cardWeaknessesType.join(",");
    if (cardWeaknessesValue !== "") cardFilters.weaknessesValue = cardWeaknessesValue;
    if (cardResistancesType.length > 0) cardFilters.resistances = cardResistancesType.join(",");
    if (cardResistancesValue !== "") cardFilters.resistancesValue = cardResistancesValue;
    if (cardConvertedRetreatCost !== "") cardFilters.convertedRetreatCost = cardConvertedRetreatCost;
    if (trimmedCardArtist) cardFilters.artist = trimmedCardArtist;
    if (trimmedCardFlavor) cardFilters.flavorText = trimmedCardFlavor;
    if (cardRegulationMark.length > 0) cardFilters.regulationMark = cardRegulationMark.join(",");
    if (cardNumber !== "") cardFilters.number = String(cardNumber);
    // CardSet (edition)
    let setIds: string[] = [];
    if (cardSetName.length > 0) {
      const { data: setData, error: setFetchError } = await supabase
        .from("CardSet")
        .select("id")
        .in("name", cardSetName);
      if (setFetchError) setError(setFetchError.message);
      if (setData && setData.length > 0) setIds = setData.map((s: any) => s.id);
    }
    // Abilities
    let abilityCardIds: string[] = [];
    if (trimmedAbilitiesName || trimmedAbilitiesText) {
      let abilityFilters: any = {};
      if (trimmedAbilitiesName) abilityFilters.name = trimmedAbilitiesName;
      if (trimmedAbilitiesText) abilityFilters.text = trimmedAbilitiesText;
      const { data: abilitiesData } = await supabase.from("Abilities").select("id").match(abilityFilters);
      if (abilitiesData && abilitiesData.length > 0) {
        const abilityIds = abilitiesData.map((a: any) => a.id);
        const { data: cardAbilities } = await supabase
          .from("CardAbilities")
          .select("cardId")
          .in("abilityId", abilityIds);
        if (cardAbilities && cardAbilities.length > 0) {
          abilityCardIds = cardAbilities.map((ca: any) => ca.cardId);
        }
      }
    }
    // Attacks
    let attackCardIds: string[] = [];
    if (trimmedAttacksName || trimmedAttacksDamage || trimmedAttacksText) {
      let attackFilters: any = {};
      if (trimmedAttacksName) attackFilters.name = trimmedAttacksName;
      if (trimmedAttacksDamage) attackFilters.damage = trimmedAttacksDamage;
      if (trimmedAttacksText) attackFilters.text = trimmedAttacksText;
      const { data: attacksData } = await supabase.from("Attacks").select("id").match(attackFilters);
      if (attacksData && attacksData.length > 0) {
        const attackIds = attacksData.map((a: any) => a.id);
        const { data: cardAttacks } = await supabase.from("CardAttacks").select("cardId").in("attackId", attackIds);
        if (cardAttacks && cardAttacks.length > 0) {
          attackCardIds = cardAttacks.map((ca: any) => ca.cardId);
        }
      }
    }
    // CardAttacks (cost, convertedEnergyCost)
    let cardAttackCardIds: string[] = [];
    if (attacksCost.length > 0 || attacksConvertedEnergyCost !== "") {
      let cardAttackFilters: any = {};
      if (attacksCost.length > 0) cardAttackFilters.cost = attacksCost.join(",");
      if (attacksConvertedEnergyCost !== "") cardAttackFilters.convertedEnergyCost = attacksConvertedEnergyCost;
      const { data: cardAttacksData } = await supabase.from("CardAttacks").select("cardId").match(cardAttackFilters);
      if (cardAttacksData && cardAttacksData.length > 0) {
        cardAttackCardIds = cardAttacksData.map((ca: any) => ca.cardId);
      }
    }
    // Compose Card query
    let query = supabase.from("Card").select("cardId");
    Object.entries(cardFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        query = query.eq(key, value);
      }
    });
    if (setIds.length > 0) {
      query = query.in("setId", setIds);
    }
    // Intersect with related IDs if present
    let relatedIds: string[][] = [];
    if (abilityCardIds.length > 0) relatedIds.push(abilityCardIds);
    if (attackCardIds.length > 0) relatedIds.push(attackCardIds);
    if (cardAttackCardIds.length > 0) relatedIds.push(cardAttackCardIds);
    let finalIds: string[] = [];
    const { data: cardData, error: cardError } = await query;
    if (cardError) {
      setError(cardError.message);
      if (setLoadingProp) setLoadingProp(false);
      return;
    }
    if (cardData && cardData.length > 0) {
      finalIds = cardData.map((c: any) => c.cardId);
      // If there are related filters, intersect the results
      if (relatedIds.length > 0) {
        finalIds = finalIds.filter((id) => relatedIds.every((arr) => arr.includes(id)));
      }
    }
    setCardIds(finalIds);
    setSearchQuery("Advanced search");
    if (onSearchResults) onSearchResults(finalIds, "Advanced search");
    if (setLoadingProp) setLoadingProp(false);
  };

  const selectedSupertype = cardSupertype[0];
  const cardSubtypesOptions = getCardSubtypesOptions(selectedSupertype);

  return (
    <ThemedView>
      <TextInput
        label="Name"
        value={cardName}
        onChange={setCardName}
        placeholder="Card name"
      />
      <Collapsible title="Card Type">
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
        {selectedSupertype !== "Trainer" && (
          <DynamicMultiSelect
            label="Color"
            value={cardTypes}
            options={cardTypesOptions}
            onChange={setCardTypes}
          />
        )}
      </Collapsible>
      <Collapsible title="Rules">
        <TextInput
          label="Rules"
          value={cardRules}
          onChange={setCardRules}
          placeholder="Rules"
        />
      </Collapsible>
      {selectedSupertype !== "Energy" && selectedSupertype !== "Trainer" && (
        <Collapsible title="Attacks">
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
        </Collapsible>
      )}
      {selectedSupertype !== "Energy" && selectedSupertype !== "Trainer" && (
        <Collapsible title="Abilities">
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
      {selectedSupertype !== "Energy" && selectedSupertype !== "Trainer" && (
        <Collapsible title="Evolution">
          {selectedSupertype !== "Energy" && selectedSupertype !== "Trainer" && (
            <DynamicMultiSelect
              label="Stage"
              value={cardStage}
              options={cardStageOptions}
              onChange={setCardStage}
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
      {selectedSupertype !== "Energy" && selectedSupertype !== "Trainer" && (
        <Collapsible title="Stats">
          <NumberInput
            label="HP"
            value={cardHp}
            onChange={setCardHp}
            placeholder="Card HP"
          />
          <NumberInput
            label="Converted Retreat Cost"
            value={cardConvertedRetreatCost}
            onChange={setCardConvertedRetreatCost}
            placeholder="Converted retreat cost"
          />
        </Collapsible>
      )}
      {selectedSupertype !== "Energy" && selectedSupertype !== "Trainer" && (
        <Collapsible title="Weaknesses/Resistances">
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
        </Collapsible>
      )}
      <Collapsible title="Artist/Flavor">
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
      <Collapsible title="Edition">
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
