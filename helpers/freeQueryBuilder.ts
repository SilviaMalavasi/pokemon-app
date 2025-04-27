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
  includedKeys?: string[]
): Promise<{ cardIds: string[]; query: string }> {
  const trimmed = search.trim();
  if (!trimmed) return { cardIds: [], query: "" };
  const searchLower = trimmed.toLowerCase();
  const cardIdSet = new Set<string>();

  // Helper to resolve Card.id to Card.cardId
  async function idsToCardIds(ids: number[]): Promise<string[]> {
    if (!ids.length) return [];
    const { data } = await supabase.from("Card").select("cardId, id").in("id", ids);
    return data?.map((row: any) => row.cardId).filter(Boolean) || [];
  }

  // Helper to resolve Card.setId to Card.cardId
  async function setIdsToCardIds(setIds: number[]): Promise<string[]> {
    if (!setIds.length) return [];
    const { data } = await supabase.from("Card").select("cardId, setId").in("setId", setIds);
    return data?.map((row: any) => row.cardId).filter(Boolean) || [];
  }

  // Only search included fields if provided
  const fieldsToSearch = includedKeys ? allFields.filter((f) => includedKeys.includes(f.column)) : allFields;

  for (const field of fieldsToSearch) {
    if (field.type === "text") {
      let query = supabase.from(field.table).select(field.table === "Card" ? "cardId" : "id");
      query = query.ilike(field.column, `%${searchLower}%`);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        if (field.table === "Card") {
          data.forEach((row: any) => row.cardId && cardIdSet.add(row.cardId));
        } else if (field.table === "CardSet") {
          // CardSet: resolve setId to cardId
          const setIds = data.map((row: any) => row.id).filter(Boolean);
          const cardIds = await setIdsToCardIds(setIds);
          cardIds.forEach((id) => cardIdSet.add(id));
        } else {
          // Attacks/Abilities: resolve id to cardId via join tables
          const ids = data.map((row: any) => row.id).filter(Boolean);
          if (field.table === "Attacks") {
            const { data: caData } = await supabase.from("CardAttacks").select("cardId").in("attackId", ids);
            const cardAttackIds = caData?.map((row: any) => row.cardId).filter(Boolean) || [];
            const cardIds = await idsToCardIds(cardAttackIds);
            cardIds.forEach((id) => cardIdSet.add(id));
          } else if (field.table === "Abilities") {
            const { data: caData } = await supabase.from("CardAbilities").select("cardId").in("abilityId", ids);
            const cardAbilityIds = caData?.map((row: any) => row.cardId).filter(Boolean) || [];
            const cardIds = await idsToCardIds(cardAbilityIds);
            cardIds.forEach((id) => cardIdSet.add(id));
          }
        }
      }
    } else if (field.type === "int") {
      const num = Number(trimmed);
      if (!isNaN(num)) {
        let query = supabase.from(field.table).select(field.table === "Card" ? "cardId" : "id");
        query = query.eq(field.column, num);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          if (field.table === "Card") {
            data.forEach((row: any) => row.cardId && cardIdSet.add(row.cardId));
          } else {
            // CardAttacks: resolve id to cardId
            const ids = data.map((row: any) => row.id).filter(Boolean);
            const { data: caData } = await supabase.from("Card").select("cardId, id").in("id", ids);
            caData?.forEach((row: any) => row.cardId && cardIdSet.add(row.cardId));
          }
        }
      }
    } else if (field.type === "json-string-array") {
      // Use .or() with ilike for arrays (as in queryBuilder)
      let query = supabase.from(field.table).select(field.table === "Card" ? "cardId" : "id");
      query = query.or(`${field.column}.ilike.%${searchLower}%`);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        if (field.table === "Card") {
          data.forEach((row: any) => row.cardId && cardIdSet.add(row.cardId));
        } else if (field.table === "CardAttacks") {
          // CardAttacks: resolve id to cardId
          const ids = data.map((row: any) => row.id).filter(Boolean);
          const { data: caData } = await supabase.from("Card").select("cardId, id").in("id", ids);
          caData?.forEach((row: any) => row.cardId && cardIdSet.add(row.cardId));
        }
      }
    }
  }

  return { cardIds: Array.from(cardIdSet), query: search };
}
