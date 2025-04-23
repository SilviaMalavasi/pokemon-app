import { supabase } from "@/lib/supabase";

export type InputConfig = {
  key: string;
  type: "text" | "number" | "multiselect";
  table: string;
  column: string;
  valueType?: "int" | "text" | "json-string-array";
};

export type QueryBuilderFilter = {
  config: InputConfig;
  value: any;
  operator?: string;
};

function intersectArrays(arrays: string[][]): string[] {
  if (arrays.length === 0) return [];
  return arrays.reduce((a, b) => a.filter((c) => b.includes(c)));
}

export async function queryBuilder(filters: QueryBuilderFilter[]): Promise<{ cardIds: string[]; query: string }> {
  // Group filters by table
  const grouped: Record<string, QueryBuilderFilter[]> = {};
  filters.forEach((f) => {
    if (f.value !== null && f.value !== undefined) {
      if (!grouped[f.config.table]) grouped[f.config.table] = [];
      grouped[f.config.table].push(f);
    }
  });

  // Helper to build a Supabase query for a table and its filters
  const buildQuery = (table: string, selectCol: string, filters: QueryBuilderFilter[]) => {
    let query = supabase.from(table).select(selectCol);
    filters.forEach(({ config, value, operator }) => {
      if (value === null || value === undefined) return;
      const col = config.column;
      if (config.type === "text") {
        const trimmed = String(value).trim();
        query = query.ilike(col, `%${trimmed}%`);
      } else if (config.type === "number") {
        if (config.valueType === "int") {
          const op = operator || "=";
          query = query.not(col, "is", null);
          if (op === ">=") query = query.gte(col, value);
          else if (op === "<=") query = query.lte(col, value);
          else query = query.eq(col, value);
        } else if (config.valueType === "text") {
          const op = operator || "=";
          if (op === ">=" || op === "<=") {
            const sqlOp = op === ">=" ? ">=" : "<=";
            query = query.filter(`CAST(regexp_replace(${col}, '[^0-9].*', '', 'g') AS INTEGER)`, sqlOp, value);
          } else {
            let matchString = String(value);
            if (op === "+" || op === "x") {
              matchString = matchString + op;
            }
            query = query.eq(col, matchString);
          }
        }
      } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
        if (config.valueType === "json-string-array") {
          const orString = value.map((typeValue: string) => `${col}.ilike.%${typeValue}%`).join(",");
          query = query.or(orString);
        } else {
          const orString = value.map((v: string) => `${col}.ilike.%${v}%`).join(",");
          query = query.or(orString);
        }
      }
    });
    return query;
  };

  // 1. Card table filters
  let cardTableIds: string[] = [];
  if (grouped["Card"]) {
    const cardQuery = buildQuery("Card", "cardId", grouped["Card"]);
    const { data, error } = await cardQuery;
    if (error) return { cardIds: [], query: error.message };
    cardTableIds = data?.map((row: any) => row.cardId) || [];
  }

  // 2. CardSet filters (Card.setId -> CardSet.id)
  let cardSetIds: string[] = [];
  if (grouped["CardSet"]) {
    const setQuery = buildQuery("CardSet", "id", grouped["CardSet"]);
    const { data, error } = await setQuery;
    if (error) return { cardIds: [], query: error.message };
    const setIds = data?.map((row: any) => row.id) || [];
    if (setIds.length > 0) {
      const { data: cardData, error: cardError } = await supabase.from("Card").select("cardId").in("setId", setIds);
      if (cardError) return { cardIds: [], query: cardError.message };
      cardSetIds = cardData?.map((row: any) => row.cardId) || [];
    }
  }

  // 3. Attacks filters (Attacks -> CardAttacks -> Card)
  let attackCardIds: string[] = [];
  if (grouped["Attacks"]) {
    const attackQuery = buildQuery("Attacks", "id", grouped["Attacks"]);
    const { data, error } = await attackQuery;
    if (error) return { cardIds: [], query: error.message };
    const attackIds = data?.map((row: any) => row.id) || [];
    if (attackIds.length > 0) {
      const { data: caData, error: caError } = await supabase
        .from("CardAttacks")
        .select("cardId")
        .in("attackId", attackIds);
      if (caError) return { cardIds: [], query: caError.message };
      const cardIdInts = caData?.map((row: any) => row.cardId) || [];
      if (cardIdInts.length > 0) {
        const { data: cardData, error: cardError } = await supabase
          .from("Card")
          .select("cardId, id")
          .in("id", cardIdInts);
        if (cardError) return { cardIds: [], query: cardError.message };
        attackCardIds = cardData?.map((row: any) => row.cardId) || [];
      }
    }
  }

  // 4. CardAttacks filters (directly on CardAttacks)
  let cardAttacksCardIds: string[] = [];
  if (grouped["CardAttacks"]) {
    const caQuery = buildQuery("CardAttacks", "cardId", grouped["CardAttacks"]);
    const { data, error } = await caQuery;
    if (error) return { cardIds: [], query: error.message };
    const cardIdInts = data?.map((row: any) => row.cardId) || [];
    if (cardIdInts.length > 0) {
      const { data: cardData, error: cardError } = await supabase
        .from("Card")
        .select("cardId, id")
        .in("id", cardIdInts);
      if (cardError) return { cardIds: [], query: cardError.message };
      cardAttacksCardIds = cardData?.map((row: any) => row.cardId) || [];
    }
  }

  // 5. Abilities filters (Abilities -> CardAbilities -> Card)
  let abilityCardIds: string[] = [];
  if (grouped["Abilities"]) {
    const abQuery = buildQuery("Abilities", "id", grouped["Abilities"]);
    const { data, error } = await abQuery;
    if (error) return { cardIds: [], query: error.message };
    const abIds = data?.map((row: any) => row.id) || [];
    if (abIds.length > 0) {
      const { data: caData, error: caError } = await supabase
        .from("CardAbilities")
        .select("cardId")
        .in("abilityId", abIds);
      if (caError) return { cardIds: [], query: caError.message };
      const cardIdInts = caData?.map((row: any) => row.cardId) || [];
      if (cardIdInts.length > 0) {
        const { data: cardData, error: cardError } = await supabase
          .from("Card")
          .select("cardId, id")
          .in("id", cardIdInts);
        if (cardError) return { cardIds: [], query: cardError.message };
        abilityCardIds = cardData?.map((row: any) => row.cardId) || [];
      }
    }
  }

  // Intersect all non-empty arrays
  const allArrays = [cardTableIds, cardSetIds, attackCardIds, cardAttacksCardIds, abilityCardIds].filter(
    (arr) => arr.length > 0
  );
  const finalCardIds = allArrays.length > 0 ? intersectArrays(allArrays) : [];
  return { cardIds: finalCardIds, query: JSON.stringify(filters) };
}
