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
  const [attacksDamage, setAttacksDamage] = useState("");
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

    // Log what is being searched
    console.log("FullForm search filters:", {
      cardFilters: {
        name: trimmedCardName,
        supertype: cardSupertype[0],
        subtypes: cardSubtypes,
        hp: cardHp,
        types: cardTypes,
        evolvesFrom: trimmedCardEvolvesFrom,
        evolvesTo: trimmedCardEvolvesTo,
        rules: trimmedCardRules,
        weaknesses: cardWeaknessesType,
        resistances: cardResistancesType,
        convertedRetreatCost: cardConvertedRetreatCost,
        artist: trimmedCardArtist,
        flavorText: trimmedCardFlavor,
        regulationMark: cardRegulationMark,
        number: cardNumber,
        setName: cardSetName,
      },
      abilities: { name: trimmedAbilitiesName, text: trimmedAbilitiesText },
      attacks: {
        name: trimmedAttacksName,
        damage: trimmedAttacksDamage,
        text: trimmedAttacksText,
        cost: attacksCost,
        convertedEnergyCost: attacksConvertedEnergyCost,
      },
    });

    // --- Build filters for Card table ---
    let cardFilters: any = {};
    // TextInput fields: flexible ilike search (OR for variants)
    const textInputs = [
      { key: "name", value: trimmedCardName },
      { key: "evolvesFrom", value: trimmedCardEvolvesFrom },
      { key: "evolvesTo", value: trimmedCardEvolvesTo },
      { key: "rules", value: trimmedCardRules },
      { key: "artist", value: trimmedCardArtist },
      { key: "flavorText", value: trimmedCardFlavor },
    ];
    textInputs.forEach(({ key, value }) => {
      if (value && value !== "") {
        const variants = [value, value.charAt(0).toUpperCase() + value.slice(1), value.toLowerCase()];
        cardFilters[`__or_${key}`] = variants.map((variant) => `${key}.ilike.%${variant}%`).join(",");
      }
    });
    // MultiSelect fields: OR ilike for each selected value
    if (cardSubtypes && cardSubtypes.length > 0) {
      cardFilters.__or_subtypes = cardSubtypes.map((subtype) => `subtypes.ilike.%${subtype}%`).join(",");
    }
    if (cardTypes && cardTypes.length > 0) {
      cardFilters.__or_types = cardTypes.map((type) => `types.ilike.%${type}%`).join(",");
    }
    if (cardWeaknessesType && cardWeaknessesType.length > 0) {
      cardFilters.__or_weaknesses = cardWeaknessesType.map((type) => `weaknesses.ilike.%${type}%`).join(",");
    }
    if (cardResistancesType && cardResistancesType.length > 0) {
      cardFilters.__or_resistances = cardResistancesType.map((type) => `resistances.ilike.%${type}%`).join(",");
    }
    if (cardRegulationMark && cardRegulationMark.length > 0) {
      cardFilters.__or_regulationMark = cardRegulationMark.map((mark) => `regulationMark.ilike.%${mark}%`).join(",");
    }
    // NumberInput fields: exact match
    if (cardHp !== undefined && cardHp !== null && cardHp !== "") cardFilters.hp = cardHp;
    if (cardConvertedRetreatCost !== undefined && cardConvertedRetreatCost !== null && cardConvertedRetreatCost !== "")
      cardFilters.convertedRetreatCost = cardConvertedRetreatCost;
    if (cardNumber !== undefined && cardNumber !== null && cardNumber !== "") cardFilters.number = String(cardNumber);
    // Single select fields
    if (cardSupertype && cardSupertype.length > 0 && cardSupertype[0] !== undefined && cardSupertype[0] !== "")
      cardFilters.supertype = cardSupertype[0];

    // CardSet (edition)
    let setIds: string[] = [];
    if (cardSetName.length > 0) {
      console.log("Searching CardSet for set names:", cardSetName);
      const { data: setData, error: setFetchError } = await supabase
        .from("CardSet")
        .select("id")
        .in("name", cardSetName);
      if (setFetchError) setError(setFetchError.message);
      if (setData && setData.length > 0) setIds = setData.map((s: any) => s.id);
      console.log("CardSet IDs found:", setIds);
    }
    // Abilities
    let abilityCardIds: string[] = [];
    if (trimmedAbilitiesName || trimmedAbilitiesText) {
      let abilityFilters: any = {};
      if (trimmedAbilitiesName) abilityFilters.name = trimmedAbilitiesName;
      if (trimmedAbilitiesText) abilityFilters.text = trimmedAbilitiesText;
      console.log("Searching Abilities with:", abilityFilters);
      const { data: abilitiesData } = await supabase.from("Abilities").select("id").match(abilityFilters);
      if (abilitiesData && abilitiesData.length > 0) {
        const abilityIds = abilitiesData.map((a: any) => a.cardId);
        console.log("Ability IDs found:", abilityIds);
        const { data: cardAbilities } = await supabase
          .from("CardAbilities")
          .select("cardId")
          .in("abilityId", abilityIds);
        if (cardAbilities && cardAbilities.length > 0) {
          abilityCardIds = cardAbilities.map((ca: any) => ca.cardId);
          console.log("Card IDs with those abilities:", abilityCardIds);
        }
      }
    }
    // Attacks
    let attackCardIds: string[] = [];
    // Separate logic for attack name/text (ilike) and damage (eq)
    if (trimmedAttacksName || trimmedAttacksText) {
      let attackQuery = supabase.from("Attacks").select("id");
      if (trimmedAttacksName) attackQuery = attackQuery.ilike("name", `%${trimmedAttacksName}%`);
      if (trimmedAttacksText) attackQuery = attackQuery.ilike("text", `%${trimmedAttacksText}%`);
      const { data: attacksData } = await attackQuery;
      if (attacksData && attacksData.length > 0) {
        const attackIds = attacksData.map((a: any) => a.id); // fix: use id, not cardId
        const { data: cardAttacks } = await supabase.from("CardAttacks").select("cardId").in("attackId", attackIds);
        if (cardAttacks && cardAttacks.length > 0) {
          attackCardIds = cardAttacks.map((ca: any) => ca.cardId);
        }
      }
    }
    if (trimmedAttacksDamage !== "") {
      // Use ilike for flexible string matching (e.g., '270+', '50×')
      console.log(`[FullForm] Searching Attacks for damage: '${trimmedAttacksDamage}'`);
      let attackQuery = supabase.from("Attacks").select("id").ilike("damage", `%${trimmedAttacksDamage}%`);
      const { data: attacksData } = await attackQuery;
      if (attacksData && attacksData.length > 0) {
        const attackIds = attacksData.map((a: any) => a.id);
        const { data: cardAttacks } = await supabase.from("CardAttacks").select("cardId").in("attackId", attackIds);
        if (cardAttacks && cardAttacks.length > 0) {
          attackCardIds = cardAttacks.map((ca: any) => ca.cardId);
        }
        console.log(
          `[FullForm] Found ${attackIds.length} attack(s) and ${attackCardIds.length} card(s) with damage '${trimmedAttacksDamage}'.`
        );
      } else {
        console.log(`[FullForm] No attacks found for damage '${trimmedAttacksDamage}'.`);
      }
    }
    // CardAttacks (cost, convertedEnergyCost)
    let cardAttackCardIds: string[] = [];
    if (attacksCost.length > 0 || attacksConvertedEnergyCost !== "") {
      let cardAttackFilters: any = {};
      if (attacksCost.length > 0) cardAttackFilters.cost = attacksCost.join(",");
      if (attacksConvertedEnergyCost !== "") cardAttackFilters.convertedEnergyCost = attacksConvertedEnergyCost;
      console.log("Searching CardAttacks with:", cardAttackFilters);
      const { data: cardAttacksData } = await supabase.from("CardAttacks").select("cardId").match(cardAttackFilters);
      if (cardAttacksData && cardAttacksData.length > 0) {
        cardAttackCardIds = cardAttacksData.map((ca: any) => ca.cardId);
        console.log("Card IDs with those CardAttacks:", cardAttackCardIds);
      }
    }
    // --- Compose Card query ---
    let query: any = supabase.from("Card").select("cardId");
    let hasCardFilters = Object.entries(cardFilters).some(([key, value]) => {
      return !(key.startsWith("__or_") && !value) && value !== undefined && value !== "" && value !== null;
    });
    // If there are related IDs (from Attacks, Abilities, etc.) and no Card filters, use those IDs directly
    let relatedIds: string[][] = [];
    if (abilityCardIds.length > 0) relatedIds.push(abilityCardIds);
    if (attackCardIds.length > 0) relatedIds.push(attackCardIds);
    if (cardAttackCardIds.length > 0) relatedIds.push(cardAttackCardIds);
    // If any relatedIds array is empty (and a filter was applied), return zero results
    if ((trimmedAbilitiesName || trimmedAbilitiesText) && abilityCardIds.length === 0) {
      setCardIds([]);
      setSearchQuery("Advanced search");
      if (onSearchResults) onSearchResults([], "Advanced search");
      if (setLoadingProp) setLoadingProp(false);
      return;
    }
    if ((trimmedAttacksName || trimmedAttacksText) && attackCardIds.length === 0) {
      setCardIds([]);
      setSearchQuery("Advanced search");
      if (onSearchResults) onSearchResults([], "Advanced search");
      if (setLoadingProp) setLoadingProp(false);
      return;
    }
    if (
      (attacksCost.length > 0 || attacksConvertedEnergyCost !== "" || trimmedAttacksDamage !== "") &&
      cardAttackCardIds.length === 0
    ) {
      setCardIds([]);
      setSearchQuery("Advanced search");
      if (onSearchResults) onSearchResults([], "Advanced search");
      if (setLoadingProp) setLoadingProp(false);
      return;
    }
    // Always map all relatedIds to cardId from Card table before returning
    // CardAttacks.cardId is INTEGER (Card.id), Card.cardId is TEXT (unique string)
    if (!hasCardFilters && relatedIds.length > 0) {
      let cardIdCandidates: any[] = [];
      if (relatedIds.length === 1) {
        // Only one filter: use unique values directly
        cardIdCandidates = Array.from(new Set(relatedIds[0]));
      } else {
        // Multiple filters: use intersection
        cardIdCandidates = relatedIds.reduce((a, b) => a.filter((id) => b.includes(id)));
      }
      console.log(`[FullForm] Card.id candidates for Card table query:`, cardIdCandidates.slice(0, 10));
      if (cardIdCandidates.length > 0) {
        const cardIdInts = cardIdCandidates.map((id) => (typeof id === "string" ? parseInt(id, 10) : id));
        const { data: cardsData } = await supabase.from("Card").select("cardId").in("id", cardIdInts);
        console.log(`[FullForm] Card rows for Card.id candidates:`, cardsData);
        if (!cardsData || cardsData.length === 0) {
          console.warn(`[FullForm] Card table query returned no results for these Card.id values!`);
        }
        const finalIds = cardsData && cardsData.length > 0 ? cardsData.map((c: any) => c.cardId) : [];
        console.log(`[FullForm] Returning ${finalIds.length} cardId(s) for attack-based search.`, finalIds);
        setCardIds(finalIds);
        setSearchQuery("Advanced search");
        if (onSearchResults) onSearchResults(finalIds, "Advanced search");
        if (setLoadingProp) setLoadingProp(false);
        return;
      } else {
        setCardIds([]);
        setSearchQuery("Advanced search");
        if (onSearchResults) onSearchResults([], "Advanced search");
        if (setLoadingProp) setLoadingProp(false);
        return;
      }
    }
    // Apply Card filters as before
    Object.entries(cardFilters).forEach(([key, value]) => {
      if (key.startsWith("__or_") && value) {
        query = query.or(value);
      } else if (value !== undefined && value !== "" && value !== null) {
        query = query.eq(key, value);
      }
    });
    if (setIds.length > 0) {
      query = query.in("setId", setIds);
    }
    // If there are related IDs, filter Card query by those IDs (AND logic)
    if (relatedIds.length > 0) {
      const intersectIds = relatedIds.reduce((a, b) => a.filter((id) => b.includes(id)));
      if (intersectIds.length > 0) {
        query = query.in("cardId", intersectIds);
      } else {
        // No intersection, so no results
        setCardIds([]);
        setSearchQuery("Advanced search");
        if (onSearchResults) onSearchResults([], "Advanced search");
        if (setLoadingProp) setLoadingProp(false);
        return;
      }
    }
    const { data: cardData, error: cardError } = await query;
    if (cardError) {
      setError(cardError.message);
      if (setLoadingProp) setLoadingProp(false);
      return;
    }
    if (cardData && cardData.length > 0) {
      const finalIds = cardData.map((c: any) => c.cardId);
      setCardIds(finalIds);
      setSearchQuery("Advanced search");
      console.log(`FullForm: found ${finalIds.length} cards.`);
      if (onSearchResults) onSearchResults(finalIds, "Advanced search");
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
        title="Rules"
        resetKey={resetKey}
      >
        <TextInput
          label="Rules"
          value={cardRules}
          onChange={setCardRules}
          placeholder="Rules"
        />
      </Collapsible>
      {cardSupertype[0] !== "Energy" && cardSupertype[0] !== "Trainer" && (
        <Collapsible
          title="Attacks"
          resetKey={resetKey}
        >
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
            labelHint="Include cards that match ANY of the selected choices."
          />

          <NumberInput
            label="Attacks Converted Energy Cost"
            value={attacksConvertedEnergyCost}
            onChange={setAttacksConvertedEnergyCost}
            placeholder="Converted energy cost"
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
          />
          <NumberInput
            label="Converted Retreat Cost"
            value={cardConvertedRetreatCost}
            onChange={setCardConvertedRetreatCost}
            placeholder="Converted retreat cost"
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
