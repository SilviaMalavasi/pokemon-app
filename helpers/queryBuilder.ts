import { supabase } from "@/lib/supabase";

export type InputConfig = {
  key: string;
  type: "text" | "number" | "multiselect";
  table: string;
  column: string;
  valueType?: "int" | "text" | "json-string-array";
  logic?: "and" | "or";
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
    // Collect all OR groups for this table
    const orGroups = filters.filter((f) => f.config.logic === "or" && Array.isArray(f.value));
    // Collect all AND filters for this table
    const andFilters = filters.filter((f) => !f.config.logic || f.config.logic === "and");
    // Apply AND filters first
    andFilters.forEach(({ config, value, operator }) => {
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
    // Combine all OR sub-filters into a single .or() clause
    if (orGroups.length > 0) {
      const allOrSubs = orGroups.flatMap((g) => g.value);
      const orFilters = allOrSubs
        .map((sub: QueryBuilderFilter) => {
          const { config, value, operator } = sub;
          if (value === null || value === undefined) return null;
          const col = config.column;
          if (config.type === "text") {
            const trimmed = String(value).trim();
            return `${col}.ilike.%${trimmed}%`;
          } else if (config.type === "number" && config.valueType === "int") {
            // Use 'eq' instead of '=' for Supabase .or()
            return `${col}.eq.${value}`;
          }
          return null;
        })
        .filter(Boolean)
        .join(",");
      if (orFilters) query = query.or(orFilters);
    }
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
    // Check if any filter is a number type with valueType 'text'
    const numberTextFilters = grouped["CardAttacks"].filter(
      (f) => f.config.type === "number" && f.config.valueType === "text"
    );
    if (numberTextFilters.length > 0) {
      // Fetch all CardAttacks rows with the relevant column
      const { data: caData, error: caError } = await supabase.from("CardAttacks").select("cardId, id, damage");
      if (caError) return { cardIds: [], query: caError.message };
      let filteredRows = caData || [];
      numberTextFilters.forEach(({ config, value, operator }) => {
        const col = config.column;
        const op = operator || "=";
        if (["=", ">=", "<="].includes(op)) {
          filteredRows = filteredRows.filter((row) => {
            const num =
              row[col as keyof typeof row] && typeof row[col as keyof typeof row] === "string"
                ? parseInt((row[col as keyof typeof row] as string).replace(/[^0-9]/g, ""), 10)
                : null;
            if (num === null || isNaN(num)) return false;
            if (op === ">=") return num >= value;
            if (op === "<=") return num <= value;
            return num === value;
          });
        } else if (op === "+" || op === "x" || op === "×") {
          const matchStrings = [`${value}x`, `${value}×`, `${value}+`];
          filteredRows = filteredRows.filter((row) => {
            if (!row[col as keyof typeof row]) return false;
            const str = String(row[col as keyof typeof row]);
            if (op === "+") return str.includes(matchStrings[2]);
            // For x/×, match either
            return str.includes(matchStrings[0]) || str.includes(matchStrings[1]);
          });
        }
      });
      const cardIdInts = filteredRows.map((row) => row.cardId);
      if (cardIdInts.length > 0) {
        const { data: cardData, error: cardError } = await supabase
          .from("Card")
          .select("cardId, id")
          .in("id", cardIdInts);
        if (cardError) return { cardIds: [], query: cardError.message };
        cardAttacksCardIds = cardData?.map((row: any) => row.cardId) || [];
      }
    } else {
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

  // Intersect or union all non-empty arrays
  let finalCardIds: string[] = [];
  const allArrays = [cardTableIds, cardSetIds, attackCardIds, cardAttacksCardIds, abilityCardIds].filter(
    (arr) => arr.length > 0
  );
  // If any filter group uses logic: 'or', use union, else use intersection
  const hasOrLogic = Object.values(grouped).some((filters) => filters.some((f) => f.config.logic === "or"));
  if (allArrays.length > 0) {
    if (hasOrLogic) {
      // Union
      finalCardIds = Array.from(new Set(allArrays.flat()));
    } else {
      // Intersection
      finalCardIds = intersectArrays(allArrays);
    }
  }
  return { cardIds: finalCardIds, query: JSON.stringify(filters) };
}
