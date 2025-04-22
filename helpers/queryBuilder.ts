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

export async function queryBuilder(filters: QueryBuilderFilter[]): Promise<{ cardIds: string[]; query: string }> {
  // Build the query for Card table fields
  // Related table logic: config.table !== 'Card'
  let whereClauses: string[] = [];
  let params: any[] = [];

  filters.forEach(({ config, value, operator }) => {
    if (!value || config.table !== "Card") return; // skip empty or related fields for now
    const col = config.column;
    if (config.type === "text") {
      const trimmed = String(value).trim();
      whereClauses.push(`LOWER(${col}) LIKE ?`);
      params.push(`%${trimmed.toLowerCase()}%`);
    } else if (config.type === "number") {
      if (config.valueType === "int") {
        const op = operator || "=";
        whereClauses.push(`${col} ${op} ?`);
        params.push(Number(value));
      } else if (config.valueType === "text") {
        const op = operator || "=";
        if (op === ">=" || op === "<=") {
          // For >= or <= on text columns, extract leading number and compare numerically (Postgres)
          const sqlOp = op === ">=" ? ">=" : "<=";
          whereClauses.push(`CAST(regexp_replace(${col}, '[^0-9].*', '', 'g') AS INTEGER) ${sqlOp} ?`);
          params.push(Number(value));
        } else {
          // For =, +, x: match as string
          let matchString = String(value);
          if (op === "+" || op === "x") {
            matchString = matchString + op;
          }
          whereClauses.push(`${col} = ?`);
          params.push(matchString);
        }
      }
    } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
      whereClauses.push(`${col} IN (${value.map(() => "?").join(",")})`);
      params.push(...value);
    }
  });

  // Use Supabase query builder
  let query = supabase.from("Card").select("cardId");
  if (whereClauses.length > 0) {
    filters.forEach(({ config, value, operator }) => {
      if (!value || config.table !== "Card") return;
      const col = config.column;

      // If we are serching from a text input to a text column
      if (config.type === "text") {
        const trimmed = String(value).trim();
        query = query.ilike(col, `%${trimmed}%`);
      } else if (config.type === "number") {
        // If we are serching from a num input to a int column
        if (config.valueType === "int") {
          const op = operator || "=";
          if (op === ">=") query = query.gte(col, value);
          else if (op === "<=") query = query.lte(col, value);
          else query = query.eq(col, value);
        }
        // If we are serching from a num input to a text column
        else if (config.valueType === "text") {
          const op = operator || "=";
          if (op === ">=" || op === "<=") {
            // Supabase/Postgres: use filter with SQL expression for numeric comparison on text
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
        // If we are serching from a multiselect input to a text column
      } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
        query = query.in(col, value);
      }
    });
  }

  const { data, error } = await query;
  if (error) {
    return { cardIds: [], query: error.message };
  }
  const cardIds = data?.map((row: any) => row.cardId) || [];
  return { cardIds, query: JSON.stringify(filters) };
}
