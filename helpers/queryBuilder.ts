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

export async function queryBuilder(filters: QueryBuilderFilter[]): Promise<{ cardIds: string[]; query: string }> {
  // Only Card table fields for now
  let query = supabase.from("Card").select("cardId");

  filters.forEach(({ config, value, operator }) => {
    // Only skip if value is null or undefined, not if 0 or ''
    if (value === null || value === undefined || config.table !== "Card") return;
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
        if (Array.isArray(value)) {
          const orString = value.map((typeValue: string) => `${col}.ilike.%${typeValue}%`).join(",");
          query = query.or(orString);
        } else {
          query = query.ilike(col, `%${value}%`);
        }
      } else {
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
