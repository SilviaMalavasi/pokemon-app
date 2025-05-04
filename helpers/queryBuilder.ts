import { supabase } from "@/lib/supabase";

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

// Type guard to check if a filter requires JS-based numeric comparison on text
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
  return false; // Should not happen if called correctly
}

function intersectArrays(arrays: string[][]): string[] {
  if (arrays.length === 0) return [];
  return arrays.reduce((a, b) => a.filter((c) => b.includes(c)));
}

// Helper function to apply a single filter to a Supabase query instance
// Adapts logic from the original buildQuery but is designed to be called iteratively
// Handles joined tables by checking config.table
// Filters requiring JS text-numeric comparison are skipped here
function applyFilterToQuery(query: any, filter: QueryBuilderFilter) {
  const { config, value, operator } = filter;
  if (value === null || value === undefined) return query;

  // Skip filters that need special JS handling
  if (requiresJsTextNumericFilter(filter)) {
    return query;
  }

  const col = config.table === "Attacks" ? `Attacks.${config.column}` : config.column;
  const tablePrefix = config.table === "Attacks" ? "Attacks." : ""; // For OR clauses if needed

  if (config.type === "text") {
    const trimmed = String(value).trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      // AND logic for multiple words within a single text filter
      words.forEach((word) => {
        query = query.ilike(col, `%${word}%`);
      });
    } else if (trimmed) {
      // Ensure trimmed is not empty
      query = query.ilike(col, `%${trimmed}%`);
    }
  } else if (config.type === "number") {
    if (config.valueType === "int") {
      const op = operator || "=";
      query = query.not(col, "is", null); // Ensure column is not null for comparison
      if (op === ">=") query = query.gte(col, value);
      else if (op === "<=") query = query.lte(col, value);
      else query = query.eq(col, value); // Default to equals
    } else if (config.valueType === "text") {
      // Exact match for text like '100+' or '100x' (handled here, GTE/LTE handled in JS)
      const op = operator || "=";
      if (op !== ">=" && op !== "<=") {
        // Only handle non-range operators here
        let matchString = String(value);
        if (operator === "+" || operator === "x" || operator === "×") {
          // Allow matching 'x' or '×' if operator is 'x'
          const variations = operator === "x" ? [`${value}x`, `${value}×`] : [`${value}${operator}`];
          const orClause = variations.map((v) => `${col}.eq.${v}`).join(",");
          query = query.or(orClause);
        } else {
          query = query.eq(col, matchString); // Exact match for other cases
        }
      }
      // GTE/LTE cases are handled post-fetch in JS
    }
  } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
    // Assumes multiselect applies to columns storing arrays or requires OR logic
    // This might need refinement based on actual schema (jsonb contains? text array overlap?)
    if (config.valueType === "json-string-array" || Array.isArray(value)) {
      // Using OR logic for multiselect items (match any of the selected values)
      // Assuming ilike for text search within array elements or direct match
      // This might need adjustment based on column type (e.g., `cs` for jsonb)
      const orString = value.map((v: string) => `${col}.ilike.%${v}%`).join(",");
      if (orString) query = query.or(orString);
    }
    // Add other multiselect handling if needed (e.g., contains all using `cs` or `cd`)
  }
  return query;
}

export async function queryBuilder(filters: QueryBuilderFilter[]): Promise<{ cardIds: string[]; query: string }> {
  // Normalize all variants of 'pokemon', 'pokèmon', 'pokémon' (any case) to 'Pokémon' (capital P, é)
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

  // Helper to build a Supabase query for a table and its filters (Original for non-joined tables)
  const buildQuery = (table: string, selectCol: string, filters: QueryBuilderFilter[]) => {
    let query = supabase.from(table).select(selectCol);
    // Collect all OR groups for this table
    // TODO: Refine OR logic if needed - currently assumes OR applies to sub-filters within a specific filter config
    const orGroups = filters.filter((f) => f.config.logic === "or" && Array.isArray(f.value));
    // Collect all AND filters for this table
    const andFilters = filters.filter((f) => !f.config.logic || f.config.logic === "and");

    // Apply AND filters first using the helper (skips JS-handled ones)
    andFilters.forEach((f) => {
      query = applyFilterToQuery(query, f);
    });

    // Combine all OR sub-filters into a single .or() clause
    // Note: This OR logic might need review based on exact requirements.
    // It currently assumes sub-filters within an OR group are OR'd together.
    if (orGroups.length > 0) {
      const allOrSubs = orGroups.flatMap((g) => g.value); // Assuming g.value is array of sub-filters
      const orFilterStrings = allOrSubs
        .map((sub: QueryBuilderFilter) => {
          // Skip JS handled filters in OR clause generation as well
          if (requiresJsTextNumericFilter(sub)) return null;

          const { config, value } = sub;
          if (value === null || value === undefined || value === "") return null;
          const col = config.column; // Assuming OR logic applies to columns in the primary table

          if (config.type === "text") {
            const trimmed = String(value).trim();
            return trimmed ? `${col}.ilike.%${trimmed}%` : null;
          } else if (config.type === "number" && config.valueType === "int") {
            // Assuming OR uses equals for numbers unless specified otherwise
            return `${col}.eq.${value}`;
          } else if (config.type === "number" && config.valueType === "text") {
            // Handle exact match text-numeric in OR
            const op = sub.operator || "=";
            if (op !== ">=" && op !== "<=") {
              let matchString = String(value);
              if (sub.operator === "+" || sub.operator === "x" || sub.operator === "×") {
                const variations = sub.operator === "x" ? [`${value}x`, `${value}×`] : [`${value}${sub.operator}`];
                return variations.map((v) => `${col}.eq.${v}`).join(","); // This creates nested ORs, might need flattening
              } else {
                return `${col}.eq.${matchString}`;
              }
            }
            return null; // Skip GTE/LTE for OR clause generation
          } else if (config.type === "multiselect" && Array.isArray(value) && value.length > 0) {
            // Handle multiselect within OR - assumes OR between items
            const orString = value.map((v: string) => `${col}.ilike.%${v}%`).join(",");
            return orString || null;
          }
          // Add other types for OR if needed
          return null;
        })
        .filter(Boolean)
        .join(","); // Combine all OR conditions

      if (orFilterStrings) query = query.or(orFilterStrings);
    }
    return query;
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

    const cardQuery = buildQuery("Card", cardSelect, grouped["Card"]).order("name");
    const { data, error } = await cardQuery;
    if (error) {
      console.error("Card Query Error:", error);
      return { cardIds: [], query: `Card Error: ${error.message}` };
    }

    let filteredData = data || [];
    // Apply JS filters if any
    if (cardJsFilters.length > 0) {
      filteredData = filteredData.filter((row) => {
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
    // CardSet table itself doesn't seem to have text-numeric columns needing JS filter in the example
    const setQuery = buildQuery("CardSet", "id", grouped["CardSet"]);
    const { data, error } = await setQuery;
    if (error) {
      console.error("CardSet Query Error:", error);
      return { cardIds: [], query: `CardSet Error: ${error.message}` };
    }
    const setIds = data?.map((row: any) => row.id) || [];
    if (setIds.length > 0) {
      const { data: cardData, error: cardError } = await supabase
        .from("Card")
        .select("cardId")
        .in("setId", setIds)
        .order("name");
      if (cardError) {
        console.error("Card Query (Set Join) Error:", cardError);
        return { cardIds: [], query: `Card (Set Join) Error: ${cardError.message}` };
      }
      cardSetIds = cardData?.map((row: any) => row.cardId) || [];
    } else if (grouped["CardSet"].length > 0) {
      // Check if filters were applied
      // If set filters applied but found no sets, no cards can match
      cardSetIds = [];
    }
  }

  // --- REFACTORED: Unified Attacks+CardAttacks filter logic ---
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
        f.value.some((v) => v !== null && v !== undefined && v !== "") // Ensure there's at least one slot defined
    );

    // Determine columns needed for JS filtering
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
        selectCols += `, Attacks!inner(id, ${Array.from(new Set(requiredAttackCols)).join(", ")})`;
      } else {
        selectCols += `, Attacks!inner(id)`; // Always need join for filtering
      }
    } else {
      // Base select for DB-only filtering
      selectCols = "cardId, Attacks!inner(id)";
    }

    if (costOpFilter && costSlotsFilter) {
      // --- Special Case: Exact Cost + Slots ---
      const slots = costSlotsFilter.value.filter((v: string | null) => v !== null && v !== undefined && v !== ""); // Use only non-empty types
      const requiredCost = costOpFilter.value;

      // Select cost if needed for JS filtering later, otherwise just cardId
      let specialSelect = `cardId, cost`; // Need cost for slot check
      if (attackJsFilters.length > 0) {
        const requiredCols = attackJsFilters.map((f) => f.config.column);
        const requiredAttackCols = attackJsFilters
          .filter((f) => f.config.table === "Attacks")
          .map((f) => f.config.column);
        const requiredCardAttackCols = attackJsFilters
          .filter((f) => f.config.table === "CardAttacks" && f.config.column !== "cost")
          .map((f) => f.config.column); // Exclude cost if already selected

        specialSelect += `, ${Array.from(new Set(requiredCardAttackCols)).join(", ")}`;
        if (requiredAttackCols.length > 0) {
          specialSelect += `, Attacks!inner(id, name, text, ${Array.from(new Set(requiredAttackCols)).join(", ")})`; // Add name/text for context if needed
        } else {
          specialSelect += `, Attacks!inner(id, name, text)`;
        }
      } else {
        specialSelect += `, Attacks!inner(id, name, text)`;
      }

      // Build query, apply DB filters first
      let query = supabase.from("CardAttacks").select(specialSelect).eq("convertedEnergyCost", requiredCost); // Apply exact cost filter

      // Apply other DB attack-related filters (non-cost/slot)
      attackDbFilters.forEach((f) => {
        if (f.config.key !== costOpFilter.config.key && f.config.key !== costSlotsFilter.config.key) {
          query = applyFilterToQuery(query, f); // Use the helper (skips JS ones)
        }
      });

      const { data, error } = await query;
      if (error) {
        console.error("Unified Attack Query Error (Special Cost):", error);
        return { cardIds: [], query: `Unified Attack Error (Special Cost): ${error.message}` };
      }

      // JS filter for cost array structure AND text-numeric filters
      const filteredData = (data || []).filter((row: any) => {
        // 1. Check cost array structure
        let costArr: string[] = [];
        try {
          costArr = Array.isArray(row.cost) ? row.cost : row.cost ? JSON.parse(row.cost) : [];
        } catch {
          costArr = [];
        }

        if (costArr.length !== slots.length) return false;
        const costArrCopy = [...costArr];
        for (const slot of slots) {
          const idx = costArrCopy.indexOf(slot);
          if (idx === -1) return false;
          costArrCopy.splice(idx, 1);
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
      let query = supabase.from("CardAttacks").select(selectCols); // Select columns needed for JS filters

      // Apply all DB attack-related filters
      attackDbFilters.forEach((f) => {
        query = applyFilterToQuery(query, f); // Skips JS ones
      });

      const { data, error } = await query;
      if (error) {
        console.error("Unified Attack Query Error (General):", error);
        return { cardIds: [], query: `Unified Attack Error (General): ${error.message}` };
      }

      // Apply JS filters post-fetch
      const filteredData = (data || []).filter((row: any) => {
        return attackJsFilters.every((f) => {
          // Access nested column if filter is for Attacks table
          const rowValue = f.config.table === "Attacks" ? row.Attacks?.[f.config.column] : row[f.config.column];
          return checkJsTextNumericFilter(rowValue, f.value, f.operator!);
        });
      });

      cardIdInts = Array.from(new Set(filteredData.map((row: any) => row.cardId)));
    }

    // Final lookup to get cardId strings
    if (cardIdInts.length > 0) {
      const { data: cardData, error: cardError } = await supabase
        .from("Card")
        .select("cardId") // Select the string cardId
        .in("id", cardIdInts) // Filter by the integer IDs
        .order("name");
      if (cardError) {
        console.error("Card Query (Attack Join) Error:", cardError);
        return { cardIds: [], query: `Card (Attack Join) Error: ${cardError.message}` };
      }
      unifiedAttackCardIds = cardData?.map((row: any) => row.cardId) || [];
    } else if (attackRelatedFilters.length > 0) {
      // Check if filters were applied
      // If attack filters applied but found no matching attacks/cards
      unifiedAttackCardIds = [];
    }
  }

  // --- SECTION 4 REMOVED ---

  // 5. Abilities filters (Abilities -> CardAbilities -> Card)
  let abilityCardIds: string[] = [];
  if (grouped["Abilities"]) {
    // Abilities table itself doesn't seem to have text-numeric columns needing JS filter
    const abQuery = buildQuery("Abilities", "id", grouped["Abilities"]);
    const { data, error } = await abQuery;
    if (error) {
      console.error("Abilities Query Error:", error);
      return { cardIds: [], query: `Abilities Error: ${error.message}` };
    }
    const abIds = data?.map((row: any) => row.id) || [];
    if (abIds.length > 0) {
      // Get cardId (integer) from CardAbilities
      const { data: caData, error: caError } = await supabase
        .from("CardAbilities")
        .select("cardId")
        .in("abilityId", abIds);
      if (caError) {
        console.error("CardAbilities Query Error:", caError);
        return { cardIds: [], query: `CardAbilities Error: ${caError.message}` };
      }
      const cardIdInts = Array.from(new Set(caData?.map((row: any) => row.cardId) || [])); // Unique integer IDs

      if (cardIdInts.length > 0) {
        // Get cardId (string) from Card
        const { data: cardData, error: cardError } = await supabase
          .from("Card")
          .select("cardId")
          .in("id", cardIdInts)
          .order("name");
        if (cardError) {
          console.error("Card Query (Ability Join) Error:", cardError);
          return { cardIds: [], query: `Card (Ability Join) Error: ${cardError.message}` };
        }
        abilityCardIds = cardData?.map((row: any) => row.cardId) || [];
      } else {
        abilityCardIds = [];
      }
    } else if (grouped["Abilities"].length > 0) {
      // Check if filters were applied
      // If ability filters applied but found no abilities, no cards can match
      abilityCardIds = [];
    }
  }

  // 6. CardAbilities exists filter (for 'has any ability')
  let hasAnyAbilityCardIds: string[] = [];
  if (grouped["CardAbilities"]) {
    // Assuming CardAbilities doesn't have JS-handled filters itself
    const existsFilter = grouped["CardAbilities"].find(
      (f) => f.config.type === "exists" && f.config.table === "CardAbilities"
    );
    if (existsFilter) {
      // Get all unique cardIds (integer) from CardAbilities
      // Optimization: Select distinct cardId directly if performance is an issue
      const { data, error } = await supabase.from("CardAbilities").select("cardId");
      if (error) {
        console.error("CardAbilities Exists Query Error:", error);
        return { cardIds: [], query: `CardAbilities Exists Error: ${error.message}` };
      }
      const cardIdInts = Array.from(new Set(data?.map((row: any) => row.cardId) || [])); // Unique integer IDs

      if (cardIdInts.length > 0) {
        // Get cardId (string) from Card
        const { data: cardData, error: cardError } = await supabase
          .from("Card")
          .select("cardId")
          .in("id", cardIdInts)
          .order("name");
        if (cardError) {
          console.error("Card Query (Ability Exists Join) Error:", cardError);
          return { cardIds: [], query: `Card (Ability Exists Join) Error: ${cardError.message}` };
        }
        hasAnyAbilityCardIds = cardData?.map((row: any) => row.cardId) || [];
      } else {
        hasAnyAbilityCardIds = [];
      }
    }
    // Handle other CardAbilities filters if they exist and need JS handling
  }

  // Intersect or union all non-empty arrays
  let finalCardIds: string[] = [];
  // Define the keys and corresponding result arrays IN THE CORRECT ORDER
  const filterGroupKeys = ["Card", "CardSet", "AttacksOrCardAttacks", "Abilities", "CardAbilities"]; // Use a combined key for attacks
  const correspondingArrays = [
    cardTableIds,
    cardSetIds,
    unifiedAttackCardIds, // Use the result from the unified logic
    abilityCardIds,
    hasAnyAbilityCardIds,
  ];

  // Build a list of arrays for only the active filter groups
  const activeArrays = filterGroupKeys
    .map((key, idx) => {
      let isActive = false;
      if (key === "AttacksOrCardAttacks") {
        isActive = !!(grouped["Attacks"] || grouped["CardAttacks"]);
      } else {
        isActive = !!grouped[key];
      }
      // Only include the array if the corresponding group had filters applied
      return isActive ? correspondingArrays[idx] : null;
    })
    .filter((arr): arr is string[] => Array.isArray(arr)); // Filter out nulls (groups with no filters)

  // Determine final logic (AND vs OR)
  // OR logic applies if *any* filter across *any* group specifies it.
  const hasOrLogic = normalizedFilters.some((f) => f.config.logic === "or");

  // Check if any filters were actually provided
  const hasAnyFilters = normalizedFilters.length > 0;

  if (!hasAnyFilters) {
    // No filters applied, return empty (or fetch all cards if desired)
    console.warn("No filters applied, returning empty array.");
    return { cardIds: [], query: "No filters applied" };
  }

  if (activeArrays.length === 0 && hasAnyFilters) {
    // Filters were applied, but no groups yielded results OR no groups had filters applied initially
    // (e.g., only empty string filters provided)
    return { cardIds: [], query: JSON.stringify(filters) };
  }

  // Apply AND/OR logic
  if (hasOrLogic) {
    // UNION results if any OR logic is present
    finalCardIds = Array.from(new Set(activeArrays.flat()));
  } else {
    // INTERSECT results if only AND logic is used
    // Crucial check: If any active group resulted in an empty array, the intersection is empty.
    if (activeArrays.some((arr) => arr.length === 0)) {
      finalCardIds = [];
    } else {
      finalCardIds = intersectArrays(activeArrays);
    }
  }

  // Return the final list of card IDs and the original filter query for debugging/info
  return { cardIds: finalCardIds.sort(), query: JSON.stringify(filters) };
}
