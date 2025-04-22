import { supabase } from "@/lib/supabase";

export type InputConfig = {
  key: string;
  type: "text" | "number" | "multiselect";
  table: string;
  column: string;
  valueType?: "int" | "text";
};

export type QueryBuilderFilter = {
  config: InputConfig;
  value: any;
  operator?: string;
};

// Helper: columns that are arrays in the DB (adjust as needed)
const ARRAY_COLUMNS = ["types", "weaknesses", "resistances", "cost", "regulationMark"];

export async function queryBuilder(filters: QueryBuilderFilter[]): Promise<{ cardIds: string[]; query: string }> {
  // Only Card table fields for now
  let query = supabase.from("Card").select("cardId");

  filters.forEach(({ config, value, operator }) => {
    if (!value || config.table !== "Card") return;
    const col = config.column;
    if (config.type === "text") {
      const trimmed = String(value).trim();
      query = query.ilike(col, `%${trimmed}%`);
    } else if (config.type === "number") {
      if (config.valueType === "int") {
        const op = operator || "=";
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
      if (ARRAY_COLUMNS.includes(col)) {
        // Array columns: use .in
        query = query.in(col, value);
      } else {
        // Text columns: build .or with ilike for each value
        const orString = value.map((v: string) => `${col}.ilike.%${v}%`).join(",");
        query = query.or(orString);
      }
    }
  });

  const { data, error } = await query;
  if (error) {
    return { cardIds: [], query: error.message };
  }
  const cardIds = data?.map((row: any) => row.cardId) || [];
  return { cardIds, query: JSON.stringify(filters) };
}
