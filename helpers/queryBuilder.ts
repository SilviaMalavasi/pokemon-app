import { type SQLiteDatabase } from "expo-sqlite";

export type InputConfig = {
  key: string;
  type: "text" | "number" | "multiselect" | "exists";
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

function requiresJsTextNumericFilter(filter: QueryBuilderFilter): boolean {
  const { config, operator } = filter;
  return config.type === "number" && config.valueType === "text" && (operator === ">=" || operator === "<=");
}

// Helper function to perform JS-based numeric comparison on text
function checkJsTextNumericFilter(rowValue: string | null | undefined, filterValue: number, operator: string): boolean {
  if (rowValue === null || rowValue === undefined) return false;
  const numericPart = parseInt(String(rowValue).replace(/[^0-9]/g, ""), 10);
  if (isNaN(numericPart)) return false;

  if (operator === ">=") return numericPart >= filterValue;
  if (operator === "<=") return numericPart <= filterValue;
  return false;
}

function intersectArrays(arrays: string[][]): string[] {
  if (arrays.length === 0) return [];
  return arrays.reduce((a, b) => a.filter((c) => b.includes(c)));
}

// Helper function to apply a number/text operators logic a Supabase query instance
function applyFilterToQuery(query: any, filter: QueryBuilderFilter) {
  const { config, value, operator } = filter;
  if (value === null || value === undefined) return query;

  // Skip filters that need special JS handling
  if (requiresJsTextNumericFilter(filter)) {
    return query;
  }

  const col = config.table === "Attacks" ? `Attacks.${config.column}` : config.column;

  if (config.type === "text") {
    const trimmed = String(value).trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      // AND logic for multiple words within a single text filter
      words.forEach((word) => {
        query = query.ilike(col, `%${word}%`);
      });
    } else if (trimmed) {
      query = query.ilike(col, `%${trimmed}%`);
    }
  } else if (config.type === "number") {
    if (config.valueType === "int") {
      const op = operator || "=";
      query = query.not(col, "is", null);
      if (op === ">=") query = query.gte(col, value);
      else if (op === "<=") query = query.lte(col, value);
      else query = query.eq(col, value);
    } else if (config.valueType === "text") {
      // Exact match for text like '100+' or '100x'
      const op = operator || "=";
      if (op !== ">=" && op !== "<=") {
        let matchString = String(value);
        if (operator === "+" || operator === "x" || operator === "×") {
          const variations = operator === "x" ? [`${value}x`, `${value}×`] : [`${value}${operator}`];
          const orClause = variations.map((v) => `${col}.eq.${v}`).join(",");
          query = query.or(orClause);
        } else {
          query = query.eq(col, matchString); // Exact match for other cases
        }
      }
    }
  } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
    if (config.valueType === "json-string-array" || Array.isArray(value)) {
      // Using OR logic for multiselect items (match any of the selected values)
      const orString = value.map((v: string) => `${col}.ilike.%${v}%`).join(",");
      if (orString) query = query.or(orString);
    }
  }
  return query;
}

// Helper Function to Normalize all variants of 'pokemon', 'pokèmon', 'pokémon' (any case) to 'Pokémon' (capital P, é)
export async function queryBuilder(
  db: SQLiteDatabase,
  filters: QueryBuilderFilter[]
): Promise<{ cardIds: string[]; query: string }> {
  const normalizedFilters = filters.map((f) => {
    if (f.config.type === "text" && typeof f.value === "string") {
      return {
        ...f,
        value: f.value.replace(/pok[eèé]mon/gi, "Pokémon"),
      };
    }
    return f;
  });

  // Group filters by table
  const grouped: Record<string, QueryBuilderFilter[]> = {};
  normalizedFilters.forEach((f) => {
    // Ensure value is not null/undefined and not an empty string/array before adding
    const hasValue =
      f.value !== null && f.value !== undefined && f.value !== "" && (!Array.isArray(f.value) || f.value.length > 0);
    if (hasValue) {
      if (!grouped[f.config.table]) grouped[f.config.table] = [];
      grouped[f.config.table].push(f);
    }
  });

  // Helper to build a SQLite query for a table and its filters (for non-joined tables)
  const buildQuery = async (table: string, selectCol: string, filters: QueryBuilderFilter[]) => {
    let query = `SELECT ${selectCol} FROM ${table}`;
    const whereClauses: string[] = [];
    const params: any[] = [];

    // Collect all OR groups for this table
    const orGroups = filters.filter((f) => f.config.logic === "or" && Array.isArray(f.value));
    // Collect all AND filters for this table
    const andFilters = filters.filter((f) => !f.config.logic || f.config.logic === "and");

    // Apply AND filters first using the helper
    andFilters.forEach((f) => {
      const { config, value, operator } = f;
      if (value === null || value === undefined) return;

      // Skip filters that need special JS handling
      if (requiresJsTextNumericFilter(f)) {
        return;
      }

      const col = config.table === "Attacks" ? `Attacks.${config.column}` : config.column;

      if (config.type === "text") {
        const trimmed = String(value).trim();
        const words = trimmed.split(/\s+/).filter(Boolean);
        if (words.length > 1) {
          // AND logic for multiple words within a single text filter
          words.forEach((word) => {
            whereClauses.push(`${col} LIKE ?`);
            params.push(`%${word}%`);
          });
        } else if (trimmed) {
          whereClauses.push(`${col} LIKE ?`);
          params.push(`%${trimmed}%`);
        }
      } else if (config.type === "number") {
        if (config.valueType === "int") {
          const op = operator || "=";
          whereClauses.push(`${col} IS NOT NULL`);
          if (op === ">=") {
            whereClauses.push(`${col} >= ?`);
            params.push(value);
          } else if (op === "<=") {
            whereClauses.push(`${col} <= ?`);
            params.push(value);
          } else {
            whereClauses.push(`${col} = ?`);
            params.push(value);
          }
        } else if (config.valueType === "text") {
          // Exact match for text like '100+' or '100x'
          const op = operator || "=";
          if (op !== ">=" && op !== "<=") {
            let matchString = String(value);
            if (operator === "+" || operator === "x" || operator === "×") {
              const variations = operator === "x" ? [`${value}x`, `${value}×`] : [`${value}${operator}`];
              const orClause = variations.map((v) => `${col} = ?`).join(" OR ");
              whereClauses.push(`(${orClause})`);
              params.push(...variations);
            } else {
              whereClauses.push(`${col} = ?`); // Exact match for other cases
              params.push(matchString);
            }
          }
        }
      } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
        if (config.valueType === "json-string-array" || Array.isArray(value)) {
          // Using OR logic for multiselect items (match any of the selected values)
          const orString = value.map((v: string) => `${col} LIKE ?`).join(" OR ");
          if (orString) {
            whereClauses.push(`(${orString})`);
            params.push(...value.map((v: string) => `%${v}%`));
          }
        }
      }
    });

    // Combine all OR sub-filters into a single OR group
    if (orGroups.length > 0) {
      const orClauseParts: string[] = [];
      const orParams: any[] = [];

      orGroups.forEach((sub: QueryBuilderFilter) => {
        if (requiresJsTextNumericFilter(sub)) return; // Skip JS handled

        const { config, value, operator } = sub;
        // Skip if value is inherently empty for the condition
        if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0))
          return;

        const col = config.column;

        if (config.type === "text") {
          const trimmed = String(value).trim();
          if (trimmed) {
            orClauseParts.push(`${col} LIKE ?`);
            orParams.push(`%${trimmed}%`); // Push string
          }
        } else if (config.type === "number" && config.valueType === "int") {
          const op = operator || "="; // Respect operator for OR condition
          if (op === ">=") {
            orClauseParts.push(`${col} >= ?`);
            orParams.push(value); // Push number
          } else if (op === "<=") {
            orClauseParts.push(`${col} <= ?`);
            orParams.push(value); // Push number
          } else {
            // Default to '='
            orClauseParts.push(`${col} = ?`);
            orParams.push(value); // Push number
          }
        } else if (config.type === "number" && config.valueType === "text") {
          const op = operator || "=";
          if (op !== ">=" && op !== "<=") {
            // Only handle non-range operators here
            let matchString = String(value);
            if (operator === "+" || operator === "x" || operator === "×") {
              const variations = operator === "x" ? [`${value}x`, `${value}×`] : [`${value}${operator}`];
              orClauseParts.push(`(${variations.map(() => `${col} = ?`).join(" OR ")})`);
              orParams.push(...variations); // Push strings
            } else {
              orClauseParts.push(`${col} = ?`);
              orParams.push(matchString); // Push string
            }
          }
        } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
          // OR logic within the multiselect values themselves
          const multiSelectOrParts = value.map(() => `${col} LIKE ?`);
          if (multiSelectOrParts.length > 0) {
            orClauseParts.push(`(${multiSelectOrParts.join(" OR ")})`);
            orParams.push(...value.map((v: string) => `%${v}%`)); // Push strings
          }
        }
      });

      const finalOrClauseString = orClauseParts.join(" OR ");
      if (finalOrClauseString) {
        whereClauses.push(`(${finalOrClauseString})`);
        params.push(...orParams); // Push the correctly typed params for the OR group
      }
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    const result = await db.getAllAsync(query, params);
    return result;
  };

  // 1. Card table filters
  let cardTableIds: string[] = [];
  if (grouped["Card"]) {
    // Identify JS-handled filters for Card table
    const cardJsFilters = grouped["Card"].filter(requiresJsTextNumericFilter);
    let cardSelect = "cardId";
    // If JS filters exist, select the columns they need
    if (cardJsFilters.length > 0) {
      const requiredCols = cardJsFilters.map((f) => f.config.column);
      cardSelect = `cardId, ${Array.from(new Set(requiredCols)).join(", ")}`;
    }

    const cardQuery = await buildQuery("Card", cardSelect, grouped["Card"]);
    const data = cardQuery;
    if (!data) {
      console.error("Card Query Error");
      return { cardIds: [], query: `Card Error` };
    }

    let filteredData = data || [];
    if (cardJsFilters.length > 0) {
      filteredData = filteredData.filter((row: any) => {
        return cardJsFilters.every((f) =>
          checkJsTextNumericFilter(row[f.config.column as keyof typeof row] as string, f.value, f.operator!)
        );
      });
    }

    cardTableIds = filteredData.map((row: any) => row.cardId) || [];
  }

  // 2. CardSet filters (Card.setId -> CardSet.id)
  let cardSetIds: string[] = [];
  if (grouped["CardSet"]) {
    const setQuery = await buildQuery("CardSet", "id", grouped["CardSet"]);
    const data = setQuery;
    if (!data) {
      console.error("CardSet Query Error");
      return { cardIds: [], query: `CardSet Error` };
    }
    const setIds = data?.map((row: any) => row.id) || [];
    if (setIds.length > 0) {
      const placeholders = setIds.map(() => "?").join(", ");
      const cardData = await db.getAllAsync(`SELECT cardId FROM Card WHERE setId IN (${placeholders})`, ...setIds);
      if (!cardData) {
        console.error("Card Query (Set Join) Error");
        return { cardIds: [], query: `Card (Set Join) Error` };
      }
      cardSetIds = cardData?.map((row: any) => row.cardId) || [];
    } else if (grouped["CardSet"].length > 0) {
      cardSetIds = [];
    }
  }

  // 3. Attack filters  --- Unified Attacks+CardAttacks filter logic ---
  const attackRelatedFilters = [...(grouped["Attacks"] || []), ...(grouped["CardAttacks"] || [])];
  let unifiedAttackCardIds: string[] = [];

  if (attackRelatedFilters.length > 0) {
    let cardIdInts: number[] = [];

    // Separate DB filters from JS filters
    const attackDbFilters = attackRelatedFilters.filter((f) => !requiresJsTextNumericFilter(f));
    const attackJsFilters = attackRelatedFilters.filter(requiresJsTextNumericFilter);

    // Check for the special cost + slots case (these are DB filters)
    const costOpFilter = attackDbFilters.find(
      (f) =>
        (f.config.key === "convertedEnergyCost" || f.config.key === "attacksConvertedEnergyCost") &&
        f.operator === "=" &&
        f.value !== null &&
        f.value !== undefined
    );
    const costSlotsFilter = attackDbFilters.find(
      (f) =>
        (f.config.key === "costSlots" || f.config.key === "attackCostSlots") &&
        Array.isArray(f.value) &&
        f.value.some((v) => v !== null && v !== undefined && v !== "")
    );

    let selectCols = "cardId";
    if (attackJsFilters.length > 0) {
      const requiredCols = attackJsFilters.map((f) => f.config.column);
      // Ensure joined table columns are selected correctly if needed
      const requiredAttackCols = attackJsFilters
        .filter((f) => f.config.table === "Attacks")
        .map((f) => f.config.column);
      const requiredCardAttackCols = attackJsFilters
        .filter((f) => f.config.table === "CardAttacks")
        .map((f) => f.config.column);

      selectCols = `cardId, ${Array.from(new Set(requiredCardAttackCols)).join(", ")}`;
      if (requiredAttackCols.length > 0) {
        selectCols += `, Attacks.id, ${Array.from(new Set(requiredAttackCols)).join(", ")}`;
      } else {
        selectCols += `, Attacks.id`;
      }
    } else {
      selectCols = "cardId, Attacks.id";
    }

    if (costOpFilter && costSlotsFilter) {
      // --- Special Case: Exact Cost + Slots ---
      const slots = costSlotsFilter.value.filter((v: string | null) => v !== null && v !== undefined && v !== "");
      const requiredCost = costOpFilter.value;

      let specialSelect = `cardId, cost`;
      if (attackJsFilters.length > 0) {
        const requiredCols = attackJsFilters.map((f) => f.config.column);
        const requiredAttackCols = attackJsFilters
          .filter((f) => f.config.table === "Attacks")
          .map((f) => f.config.column);
        const requiredCardAttackCols = attackJsFilters
          .filter((f) => f.config.table === "CardAttacks" && f.config.column !== "cost")
          .map((f) => f.config.column);

        specialSelect += `, ${Array.from(new Set(requiredCardAttackCols)).join(", ")}`;
        if (requiredAttackCols.length > 0) {
          specialSelect += `, Attacks.id, name, text, ${Array.from(new Set(requiredAttackCols)).join(", ")}`;
        } else {
          specialSelect += `, Attacks.id, name, text`;
        }
      } else {
        specialSelect += `, Attacks.id, name, text`;
      }

      // Build query, apply DB filters first
      let query = `SELECT ${specialSelect} FROM CardAttacks WHERE convertedEnergyCost = ?`;
      const params = [requiredCost];

      // Apply other DB attack-related filters (non-cost/slot)
      attackDbFilters.forEach((f) => {
        if (f.config.key !== costOpFilter.config.key && f.config.key !== costSlotsFilter.config.key) {
          const { config, value, operator } = f;
          if (value === null || value === undefined) return;

          const col = config.table === "Attacks" ? `Attacks.${config.column}` : config.column;

          if (config.type === "text") {
            const trimmed = String(value).trim();
            const words = trimmed.split(/\s+/).filter(Boolean);
            if (words.length > 1) {
              // AND logic for multiple words within a single text filter
              words.forEach((word) => {
                query += ` AND ${col} LIKE ?`;
                params.push(`%${word}%`);
              });
            } else if (trimmed) {
              query += ` AND ${col} LIKE ?`;
              params.push(`%${trimmed}%`);
            }
          } else if (config.type === "number") {
            if (config.valueType === "int") {
              const op = operator || "=";
              query += ` AND ${col} IS NOT NULL`;
              if (op === ">=") {
                query += ` AND ${col} >= ?`;
                params.push(value);
              } else if (op === "<=") {
                query += ` AND ${col} <= ?`;
                params.push(value);
              } else {
                query += ` AND ${col} = ?`;
                params.push(value);
              }
            } else if (config.valueType === "text") {
              // Exact match for text like '100+' or '100x'
              const op = operator || "=";
              if (op !== ">=" && op !== "<=") {
                let matchString = String(value);
                if (operator === "+" || operator === "x" || operator === "×") {
                  const variations = operator === "x" ? [`${value}x`, `${value}×`] : [`${value}${operator}`];
                  const orClause = variations.map((v) => `${col} = ?`).join(" OR ");
                  query += ` AND (${orClause})`;
                  params.push(...variations);
                } else {
                  query += ` AND ${col} = ?`; // Exact match for other cases
                  params.push(matchString);
                }
              }
            }
          } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
            if (config.valueType === "json-string-array" || Array.isArray(value)) {
              // Using OR logic for multiselect items (match any of the selected values)
              const orString = value.map((v: string) => `${col} LIKE ?`).join(" OR ");
              if (orString) {
                query += ` AND (${orString})`;
                params.push(...value.map((v: string) => `%${v}%`));
              }
            }
          }
        }
      });

      const data = await db.getAllAsync(query, params);
      if (!data) {
        console.error("Unified Attack Query Error (Special Cost)");
        return { cardIds: [], query: `Unified Attack Error (Special Cost)` };
      }

      // JS filter for cost array structure AND text-numeric filters
      const filteredData = (data || []).filter((row: any) => {
        // 1. Check cost array contains all selected slots
        let costArr: string[] = [];
        try {
          costArr = Array.isArray(row.cost) ? row.cost : row.cost ? JSON.parse(row.cost) : [];
        } catch {
          costArr = [];
        }

        // Ensure the total cost matches the filter, even if not all slots were specified
        if (costArr.length !== requiredCost) return false;

        // Check if all selected slots are present in the cost array
        const costArrCopy = [...costArr];
        for (const slot of slots) {
          const idx = costArrCopy.indexOf(slot);
          if (idx === -1) return false; // A selected slot is missing
          costArrCopy.splice(idx, 1); // Remove found slot to handle duplicates correctly
        }

        // 2. Check JS text-numeric filters
        return attackJsFilters.every((f) => {
          const rowValue = f.config.table === "Attacks" ? row.Attacks?.[f.config.column] : row[f.config.column];
          return checkJsTextNumericFilter(rowValue, f.value, f.operator!);
        });
      });

      cardIdInts = Array.from(new Set(filteredData.map((row: any) => row.cardId)));
    } else {
      // --- General Case: Apply DB filters, then JS filters ---
      let query = `SELECT ${selectCols} FROM CardAttacks`;
      const params: any[] = [];

      // Apply all DB attack-related filters
      attackDbFilters.forEach((f) => {
        const { config, value, operator } = f;
        if (value === null || value === undefined) return;

        const col = config.table === "Attacks" ? `Attacks.${config.column}` : config.column;

        if (config.type === "text") {
          const trimmed = String(value).trim();
          const words = trimmed.split(/\s+/).filter(Boolean);
          if (words.length > 1) {
            // AND logic for multiple words within a single text filter
            words.forEach((word) => {
              query += ` AND ${col} LIKE ?`;
              params.push(`%${word}%`);
            });
          } else if (trimmed) {
            query += ` AND ${col} LIKE ?`;
            params.push(`%${trimmed}%`);
          }
        } else if (config.type === "number") {
          if (config.valueType === "int") {
            const op = operator || "=";
            query += ` AND ${col} IS NOT NULL`;
            if (op === ">=") {
              query += ` AND ${col} >= ?`;
              params.push(value);
            } else if (op === "<=") {
              query += ` AND ${col} <= ?`;
              params.push(value);
            } else {
              query += ` AND ${col} = ?`;
              params.push(value);
            }
          } else if (config.valueType === "text") {
            // Exact match for text like '100+' or '100x'
            const op = operator || "=";
            if (op !== ">=" && op !== "<=") {
              let matchString = String(value);
              if (operator === "+" || operator === "x" || operator === "×") {
                const variations = operator === "x" ? [`${value}x`, `${value}×`] : [`${value}${operator}`];
                const orClause = variations.map((v) => `${col} = ?`).join(" OR ");
                query += ` AND (${orClause})`;
                params.push(...variations);
              } else {
                query += ` AND ${col} = ?`; // Exact match for other cases
                params.push(matchString);
              }
            }
          }
        } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
          if (config.valueType === "json-string-array" || Array.isArray(value)) {
            // Using OR logic for multiselect items (match any of the selected values)
            const orString = value.map((v: string) => `${col} LIKE ?`).join(" OR ");
            if (orString) {
              query += ` AND (${orString})`;
              params.push(...value.map((v: string) => `%${v}%`));
            }
          }
        }
      });

      const data = await db.getAllAsync(query, params);
      if (!data) {
        console.error("Unified Attack Query Error (General)");
        return { cardIds: [], query: `Unified Attack Error (General)` };
      }

      // Apply JS filters post-fetch
      const filteredData = (data || []).filter((row: any) => {
        return attackJsFilters.every((f) => {
          const rowValue = f.config.table === "Attacks" ? row.Attacks?.[f.config.column] : row[f.config.column];
          return checkJsTextNumericFilter(rowValue, f.value, f.operator!);
        });
      });

      cardIdInts = Array.from(new Set(filteredData.map((row: any) => row.cardId)));
    }

    // Final lookup to get cardId strings
    if (cardIdInts.length > 0) {
      const placeholders = cardIdInts.map(() => "?").join(", ");
      const cardData = await db.getAllAsync(`SELECT cardId FROM Card WHERE id IN (${placeholders})`, ...cardIdInts);
      if (!cardData) {
        console.error("Card Query (Attack Join) Error");
        return { cardIds: [], query: `Card (Attack Join) Error` };
      }
      unifiedAttackCardIds = cardData?.map((row: any) => row.cardId) || [];
    } else if (attackRelatedFilters.length > 0) {
      unifiedAttackCardIds = [];
    }
  }

  // 4. Abilities filters (Abilities -> CardAbilities -> Card)
  let abilityCardIds: string[] = [];
  if (grouped["Abilities"]) {
    const abQuery = await buildQuery("Abilities", "id", grouped["Abilities"]);
    const data = abQuery;
    if (!data) {
      console.error("Abilities Query Error");
      return { cardIds: [], query: `Abilities Error` };
    }
    const abIds = data?.map((row: any) => row.id) || [];
    if (abIds.length > 0) {
      const placeholders = abIds.map(() => "?").join(", ");
      const caData = await db.getAllAsync(
        `SELECT cardId FROM CardAbilities WHERE abilityId IN (${placeholders})`,
        ...abIds
      );
      if (!caData) {
        console.error("CardAbilities Query Error");
        return { cardIds: [], query: `CardAbilities Error` };
      }
      const cardIdInts = Array.from(new Set(caData?.map((row: any) => row.cardId) || []));

      if (cardIdInts.length > 0) {
        const placeholders2 = cardIdInts.map(() => "?").join(", ");
        const cardData = await db.getAllAsync(`SELECT cardId FROM Card WHERE id IN (${placeholders2})`, ...cardIdInts);
        if (!cardData) {
          console.error("Card Query (Ability Join) Error");
          return { cardIds: [], query: `Card (Ability Join) Error` };
        }
        abilityCardIds = cardData?.map((row: any) => row.cardId) || [];
      } else {
        abilityCardIds = [];
      }
    } else if (grouped["Abilities"].length > 0) {
      abilityCardIds = [];
    }
  }

  // 4.1 CardAbilities exists filter (for 'has any ability')
  let hasAnyAbilityCardIds: string[] = [];
  if (grouped["CardAbilities"]) {
    const existsFilter = grouped["CardAbilities"].find(
      (f) => f.config.type === "exists" && f.config.table === "CardAbilities"
    );
    if (existsFilter) {
      const data = await db.getAllAsync("SELECT cardId FROM CardAbilities");
      if (!data) {
        console.error("CardAbilities Exists Query Error");
        return { cardIds: [], query: `CardAbilities Exists Error` };
      }
      const cardIdInts = Array.from(new Set(data?.map((row: any) => row.cardId) || []));

      if (cardIdInts.length > 0) {
        const placeholders = cardIdInts.map(() => "?").join(", ");
        const cardData = await db.getAllAsync(`SELECT cardId FROM Card WHERE id IN (${placeholders})`, ...cardIdInts);
        if (!cardData) {
          console.error("Card Query (Ability Exists Join) Error");
          return { cardIds: [], query: `Card (Ability Exists Join) Error` };
        }
        hasAnyAbilityCardIds = cardData?.map((row: any) => row.cardId) || [];
      } else {
        hasAnyAbilityCardIds = [];
      }
    }
  }

  // Intersect or union all non-empty arrays
  let finalCardIds: string[] = [];
  // Define the keys and corresponding result arrays IN THE CORRECT ORDER
  const filterGroupKeys = ["Card", "CardSet", "AttacksOrCardAttacks", "Abilities", "CardAbilities"];
  const correspondingArrays = [cardTableIds, cardSetIds, unifiedAttackCardIds, abilityCardIds, hasAnyAbilityCardIds];

  // Build a list of arrays for only the active filter groups
  const activeArrays = filterGroupKeys
    .map((key, idx) => {
      let isActive = false;
      if (key === "AttacksOrCardAttacks") {
        isActive = !!(grouped["Attacks"] || grouped["CardAttacks"]);
      } else {
        isActive = !!grouped[key];
      }
      return isActive ? correspondingArrays[idx] : null;
    })
    .filter((arr): arr is string[] => Array.isArray(arr));

  // Determine final logic (AND vs OR)
  // OR logic applies if *any* filter across *any* group specifies it.
  const hasOrLogic = normalizedFilters.some((f) => f.config.logic === "or");
  const hasAnyFilters = normalizedFilters.length > 0;

  if (!hasAnyFilters) {
    console.warn("No filters applied, returning empty array.");
    return { cardIds: [], query: "No filters applied" };
  }

  if (activeArrays.length === 0 && hasAnyFilters) {
    return { cardIds: [], query: JSON.stringify(filters) };
  }

  // Apply AND/OR logic
  if (hasOrLogic) {
    finalCardIds = Array.from(new Set(activeArrays.flat()));
  } else {
    if (activeArrays.some((arr) => arr.length === 0)) {
      finalCardIds = [];
    } else {
      finalCardIds = intersectArrays(activeArrays);
    }
  }

  // Return the final list of card IDs, sorted by Card name
  if (finalCardIds.length === 0) {
    return { cardIds: [], query: JSON.stringify(filters) };
  }

  // Fetch all names in batches of 1000 to avoid SQLite limit
  const batchSize = 1000;
  let nameData: { cardId: string; name: string }[] = [];
  for (let i = 0; i < finalCardIds.length; i += batchSize) {
    const batchIds = finalCardIds.slice(i, i + batchSize);
    const placeholders = batchIds.map(() => "?").join(", ");
    const data = await db.getAllAsync(`SELECT cardId, name FROM Card WHERE cardId IN (${placeholders})`, ...batchIds);
    if (data) {
      nameData = nameData.concat(data as { cardId: string; name: string }[]);
    }
  }
  // Create a map for quick lookup
  const nameMap = new Map(nameData.map((c) => [c.cardId, c.name?.toLowerCase() || ""]));
  const sortedCardIds = [...finalCardIds].sort((a, b) => {
    const nameA = nameMap.get(a) || "";
    const nameB = nameMap.get(b) || "";
    return nameA.localeCompare(nameB);
  });
  return { cardIds: sortedCardIds, query: JSON.stringify(filters) };
}
