import { supabase } from "@/lib/supabase";

// Define all fields and their types as in FreeSearchForm exclusions
const allFields: { table: string; column: string; type: "text" | "int" | "json-string-array" }[] = [
  { table: "Card", column: "name", type: "text" },
  { table: "Card", column: "supertype", type: "text" },
  { table: "Card", column: "subtypes", type: "json-string-array" },
  { table: "Card", column: "types", type: "json-string-array" },
  { table: "Card", column: "rules", type: "text" },
  { table: "Attacks", column: "name", type: "text" },
  { table: "Attacks", column: "text", type: "text" },
  { table: "CardAttacks", column: "cost", type: "json-string-array" },
  { table: "CardAttacks", column: "convertedEnergyCost", type: "int" },
  { table: "CardAttacks", column: "damage", type: "text" },
  { table: "Abilities", column: "name", type: "text" },
  { table: "Abilities", column: "text", type: "text" },
  { table: "Card", column: "evolvesFrom", type: "text" },
  { table: "Card", column: "evolvesTo", type: "json-string-array" },
  { table: "Card", column: "hp", type: "int" },
  { table: "Card", column: "convertedRetreatCost", type: "int" },
  { table: "Card", column: "weaknesses", type: "json-string-array" },
  { table: "Card", column: "resistances", type: "json-string-array" },
  { table: "CardSet", column: "name", type: "text" },
  { table: "Card", column: "regulationMark", type: "text" },
  { table: "Card", column: "cardId", type: "text" },
  { table: "Card", column: "flavorText", type: "text" },
  { table: "Card", column: "artist", type: "text" },
];

export async function freeQueryBuilder(
  search: string,
  includedTablesAndColumns?: { table: string; column: string }[]
): Promise<{ cardIds: string[]; query: string }> {
  const trimmed = search.trim();
  if (!trimmed) return { cardIds: [], query: "" };
  // Lowercase, then normalize all variants of 'pokemon', 'pokèmon', 'pokémon' to 'Pokémon' (capital P, é)
  let searchNormalized = trimmed.replace(/pok[eèé]mon/gi, "Pokémon");
  // Normalize numbers followed by x or × (e.g., 100x, 100 x, 100×) to "100×"
  searchNormalized = searchNormalized.replace(/(\d+)\s*[x×]/gi, "$1×");
  const cardIdSet = new Set<string>();

  // Helper to resolve Card.id to Card.cardId
  async function cardIdsFromCardIds(cardIds: number[]): Promise<string[]> {
    if (!cardIds.length) return [];
    const { data } = await supabase.from("Card").select("cardId, id").in("id", cardIds);
    return data?.map((row: any) => row.cardId).filter(Boolean) || [];
  }
  // Helper to resolve CardSet.id to Card.cardId
  async function cardIdsFromSetIds(setIds: number[]): Promise<string[]> {
    if (!setIds.length) return [];
    const { data } = await supabase.from("Card").select("cardId, setId").in("setId", setIds);
    return data?.map((row: any) => row.cardId).filter(Boolean) || [];
  }
  // Helper to resolve Abilities.id to Card.cardId via CardAbilities
  async function cardIdsFromAbilityIds(abilityIds: number[]): Promise<string[]> {
    if (!abilityIds.length) return [];
    const { data } = await supabase.from("CardAbilities").select("cardId, abilityId").in("abilityId", abilityIds);
    const cardIds = data?.map((row: any) => row.cardId).filter(Boolean) || [];
    return cardIdsFromCardIds(cardIds);
  }
  // Helper to resolve Attacks.id to Card.cardId via CardAttacks
  async function cardIdsFromAttackIds(attackIds: number[]): Promise<string[]> {
    if (!attackIds.length) return [];
    const { data } = await supabase.from("CardAttacks").select("cardId, attackId").in("attackId", attackIds);
    const cardIds = data?.map((row: any) => row.cardId).filter(Boolean) || [];
    return cardIdsFromCardIds(cardIds);
  }
  // Helper to resolve CardAbilities.id to Card.cardId
  async function cardIdsFromCardAbilitiesIds(cardAbilitiesIds: number[]): Promise<string[]> {
    if (!cardAbilitiesIds.length) return [];
    const { data } = await supabase.from("CardAbilities").select("cardId, id").in("id", cardAbilitiesIds);
    const cardIds = data?.map((row: any) => row.cardId).filter(Boolean) || [];
    return cardIdsFromCardIds(cardIds);
  }
  // Helper to resolve CardAttacks.id to Card.cardId
  async function cardIdsFromCardAttacksIds(cardAttacksIds: number[]): Promise<string[]> {
    if (!cardAttacksIds.length) return [];
    const { data } = await supabase.from("CardAttacks").select("cardId, id").in("id", cardAttacksIds);
    const cardIds = data?.map((row: any) => row.cardId).filter(Boolean) || [];
    return cardIdsFromCardIds(cardIds);
  }

  // Only search included fields if provided
  const fieldsToSearch =
    includedTablesAndColumns && includedTablesAndColumns.length > 0
      ? allFields.filter((f) =>
          includedTablesAndColumns.some((inc) => inc.table === f.table && inc.column === f.column)
        )
      : allFields;

  for (const field of fieldsToSearch) {
    if (field.type === "text") {
      let query = supabase.from(field.table).select("id");
      query = query.ilike(field.column, `%${searchNormalized}%`);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const ids = data.map((row: any) => row.id).filter(Boolean);
        let foundCardIds: string[] = [];
        if (field.table === "Card") {
          // Card: id is cardId
          const { data: cardData } = await supabase.from("Card").select("cardId").in("id", ids);
          foundCardIds = cardData?.map((row: any) => row.cardId).filter(Boolean) || [];
        } else if (field.table === "CardSet") {
          foundCardIds = await cardIdsFromSetIds(ids);
        } else if (field.table === "Abilities") {
          foundCardIds = await cardIdsFromAbilityIds(ids);
        } else if (field.table === "Attacks") {
          foundCardIds = await cardIdsFromAttackIds(ids);
        } else if (field.table === "CardAbilities") {
          foundCardIds = await cardIdsFromCardAbilitiesIds(ids);
        } else if (field.table === "CardAttacks") {
          foundCardIds = await cardIdsFromCardAttacksIds(ids);
        }
        foundCardIds.forEach((id) => cardIdSet.add(id));
      }
    } else if (field.type === "int") {
      const num = Number(trimmed);
      if (!isNaN(num)) {
        let query = supabase.from(field.table).select("id");
        query = query.eq(field.column, num);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const ids = data.map((row: any) => row.id).filter(Boolean);
          let foundCardIds: string[] = [];
          if (field.table === "Card") {
            const { data: cardData } = await supabase.from("Card").select("cardId").in("id", ids);
            foundCardIds = cardData?.map((row: any) => row.cardId).filter(Boolean) || [];
          } else if (field.table === "CardSet") {
            foundCardIds = await cardIdsFromSetIds(ids);
          } else if (field.table === "Abilities") {
            foundCardIds = await cardIdsFromAbilityIds(ids);
          } else if (field.table === "Attacks") {
            foundCardIds = await cardIdsFromAttackIds(ids);
          } else if (field.table === "CardAbilities") {
            foundCardIds = await cardIdsFromCardAbilitiesIds(ids);
          } else if (field.table === "CardAttacks") {
            foundCardIds = await cardIdsFromCardAttacksIds(ids);
          }
          foundCardIds.forEach((id) => cardIdSet.add(id));
        }
      }
    } else if (field.type === "json-string-array") {
      let query = supabase.from(field.table).select("id");
      query = query.or(`${field.column}.ilike.%${searchNormalized}%`);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const ids = data.map((row: any) => row.id).filter(Boolean);
        let foundCardIds: string[] = [];
        if (field.table === "Card") {
          const { data: cardData } = await supabase.from("Card").select("cardId").in("id", ids);
          foundCardIds = cardData?.map((row: any) => row.cardId).filter(Boolean) || [];
        } else if (field.table === "CardSet") {
          foundCardIds = await cardIdsFromSetIds(ids);
        } else if (field.table === "Abilities") {
          foundCardIds = await cardIdsFromAbilityIds(ids);
        } else if (field.table === "Attacks") {
          foundCardIds = await cardIdsFromAttackIds(ids);
        } else if (field.table === "CardAbilities") {
          foundCardIds = await cardIdsFromCardAbilitiesIds(ids);
        } else if (field.table === "CardAttacks") {
          foundCardIds = await cardIdsFromCardAttacksIds(ids);
        }
        foundCardIds.forEach((id) => cardIdSet.add(id));
      }
    }
  }

  // Sort cardIds by Card name (batching to avoid 1000 limit)
  const cardIdsArr = Array.from(cardIdSet);
  if (cardIdsArr.length === 0) return { cardIds: [], query: search };
  const batchSize = 1000;
  let nameData: { cardId: string; name: string }[] = [];
  for (let i = 0; i < cardIdsArr.length; i += batchSize) {
    const batchIds = cardIdsArr.slice(i, i + batchSize);
    const { data, error } = await supabase.from("Card").select("cardId, name").in("cardId", batchIds);
    if (!error && data) {
      nameData = nameData.concat(data);
    }
  }
  const nameMap = new Map(nameData.map((c) => [c.cardId, c.name?.toLowerCase() || ""]));
  const sortedCardIds = [...cardIdsArr].sort((a, b) => {
    const nameA = nameMap.get(a) || "";
    const nameB = nameMap.get(b) || "";
    return nameA.localeCompare(nameB);
  });
  return { cardIds: sortedCardIds, query: search };
}
