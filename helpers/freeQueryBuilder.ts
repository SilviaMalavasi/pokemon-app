import { SQLiteDatabase } from "expo-sqlite";

// Helper function to generate SQL placeholders like ?,?,?
function generatePlaceholders(count: number): string {
  return Array(count).fill("?").join(",");
}

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
  db: SQLiteDatabase,
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
  async function cardIdsFromCardIds(ids: number[]): Promise<string[]> {
    if (!ids.length) return [];
    const placeholders = generatePlaceholders(ids.length);
    const results = await db.getAllAsync<{ cardId: string }>(
      `SELECT cardId FROM Card WHERE id IN (${placeholders})`,
      ids
    );
    return results.map((row) => row.cardId).filter(Boolean);
  }

  // Helper to resolve CardSet.id to Card.cardId
  async function cardIdsFromSetIds(setIds: number[]): Promise<string[]> {
    if (!setIds.length) return [];
    const placeholders = generatePlaceholders(setIds.length);
    const results = await db.getAllAsync<{ cardId: string }>(
      `SELECT cardId FROM Card WHERE setId IN (${placeholders})`,
      setIds
    );
    return results.map((row) => row.cardId).filter(Boolean);
  }

  // Helper to resolve Abilities.id to Card.cardId via CardAbilities
  async function cardIdsFromAbilityIds(abilityIds: number[]): Promise<string[]> {
    if (!abilityIds.length) return [];
    const placeholders = generatePlaceholders(abilityIds.length);
    const cardIdResults = await db.getAllAsync<{ cardId: number }>(
      `SELECT cardId FROM CardAbilities WHERE abilityId IN (${placeholders})`,
      abilityIds
    );
    const cardIds = cardIdResults.map((row) => row.cardId).filter((id): id is number => id != null); // Type guard
    if (!cardIds.length) return [];
    return cardIdsFromCardIds(cardIds);
  }

  // Helper to resolve Attacks.id to Card.cardId via CardAttacks
  async function cardIdsFromAttackIds(attackIds: number[]): Promise<string[]> {
    if (!attackIds.length) return [];
    const placeholders = generatePlaceholders(attackIds.length);
    const cardIdResults = await db.getAllAsync<{ cardId: number }>(
      `SELECT cardId FROM CardAttacks WHERE attackId IN (${placeholders})`,
      attackIds
    );
    const cardIds = cardIdResults.map((row) => row.cardId).filter((id): id is number => id != null);
    if (!cardIds.length) return [];
    return cardIdsFromCardIds(cardIds);
  }

  // Helper to resolve CardAbilities.id to Card.cardId
  async function cardIdsFromCardAbilitiesIds(cardAbilitiesIds: number[]): Promise<string[]> {
    if (!cardAbilitiesIds.length) return [];
    const placeholders = generatePlaceholders(cardAbilitiesIds.length);
    const cardIdResults = await db.getAllAsync<{ cardId: number }>(
      `SELECT cardId FROM CardAbilities WHERE id IN (${placeholders})`,
      cardAbilitiesIds
    );
    const cardIds = cardIdResults.map((row) => row.cardId).filter((id): id is number => id != null);
    if (!cardIds.length) return [];

    return cardIdsFromCardIds(cardIds);
  }
  // Helper to resolve CardAttacks.id to Card.cardId
  async function cardIdsFromCardAttacksIds(cardAttacksIds: number[]): Promise<string[]> {
    if (!cardAttacksIds.length) return [];
    const placeholders = generatePlaceholders(cardAttacksIds.length);
    // First, get the Card.id (numeric PK) from CardAttacks using its own id
    const cardIdResults = await db.getAllAsync<{ cardId: number }>(
      `SELECT cardId FROM CardAttacks WHERE id IN (${placeholders})`,
      cardAttacksIds
    );
    const cardIds = cardIdResults.map((row) => row.cardId).filter((id): id is number => id != null);
    if (!cardIds.length) return [];
    return cardIdsFromCardIds(cardIds);
  }

  const fieldsToSearch =
    includedTablesAndColumns && includedTablesAndColumns.length > 0
      ? allFields.filter((f) =>
          includedTablesAndColumns.some((inc) => inc.table === f.table && inc.column === f.column)
        )
      : allFields;

  for (const field of fieldsToSearch) {
    let results: { id: number }[] = [];
    try {
      if (field.type === "text" || field.type === "json-string-array") {
        if (field.table === "Card" && field.column === "cardId") {
          const cardResults = await db.getAllAsync<{ cardId: string }>(
            `SELECT cardId FROM Card WHERE cardId LIKE ? COLLATE NOCASE`,
            [`%${searchNormalized}%`]
          );
          // Add directly to set as they are already cardIds
          cardResults.forEach((row) => cardIdSet.add(row.cardId));
        } else {
          // For other text/json fields, query the respective table
          results = await db.getAllAsync<{ id: number }>(
            `SELECT id FROM ${field.table} WHERE ${field.column} LIKE ? COLLATE NOCASE`,
            [`%${searchNormalized}%`]
          );
          const ids = results.map((row) => row.id).filter(Boolean);
          if (ids.length > 0) {
            // Only proceed if we found IDs
            let foundCardIds: string[] = [];
            if (field.table === "Card") {
              foundCardIds = await cardIdsFromCardIds(ids);
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
      } else if (field.type === "int") {
        const num = Number(trimmed);
        if (!isNaN(num)) {
          results = await db.getAllAsync<{ id: number }>(`SELECT id FROM ${field.table} WHERE ${field.column} = ?`, [
            num,
          ]);
          const ids = results.map((row) => row.id).filter(Boolean);
          if (ids.length > 0) {
            // Only proceed if we found IDs
            let foundCardIds: string[] = [];
            if (field.table === "Card") {
              foundCardIds = await cardIdsFromCardIds(ids);
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`[FreeSearch] Error searching ${field.table}.${field.column}:`, err.message);
      } else {
        console.error(`[FreeSearch] Unknown error searching ${field.table}.${field.column}:`, err);
      }
    }
  }

  // Sort cardIds by Card name (batching to avoid large IN clauses)
  const cardIdsArr = Array.from(cardIdSet);
  if (cardIdsArr.length === 0) return { cardIds: [], query: search };

  const batchSize = 999; // SQLite parameter limit
  let nameData: { cardId: string; name: string }[] = [];
  try {
    for (let i = 0; i < cardIdsArr.length; i += batchSize) {
      const batchIds = cardIdsArr.slice(i, i + batchSize);
      const placeholders = generatePlaceholders(batchIds.length);
      const batchData = await db.getAllAsync<{ cardId: string; name: string }>(
        `SELECT cardId, name FROM Card WHERE cardId IN (${placeholders})`,
        batchIds
      );
      nameData = nameData.concat(batchData);
    }
  } catch (err: unknown) {
    console.error("[FreeSearch] Error fetching card names for sorting:", err);
    return { cardIds: cardIdsArr, query: search };
  }

  const nameMap = new Map(nameData.map((c) => [c.cardId, c.name?.toLowerCase() || ""]));
  const sortedCardIds = [...cardIdsArr].sort((a, b) => {
    const nameA = nameMap.get(a) || "";
    const nameB = nameMap.get(b) || "";
    return nameA.localeCompare(nameB);
  });

  return { cardIds: sortedCardIds, query: search };
}
