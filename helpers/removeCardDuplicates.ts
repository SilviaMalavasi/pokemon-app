import { SQLiteDatabase } from "expo-sqlite";

/**
 * Remove duplicate cards from a list of card objects according to Pokémon TCG rules.
 * - For Pokémon: duplicates have same name, hp, and set of attacks (name, damage, cost)
 * - For Trainer and Energy: duplicates have same name and rules (rules is a JSON array or string)
 * @param db SQLite database instance
 * @param cards Array of card objects (must include cardId, name, supertype, hp, rules)
 * @returns Array of unique card objects
 */
export async function removeCardDuplicates(db: SQLiteDatabase, cards: any[]): Promise<any[]> {
  // Separate cards by supertype
  const pokemonCards = cards.filter((c) => c.supertype === "Pokémon");
  const trainerCards = cards.filter((c) => c.supertype === "Trainer");
  const energyCards = cards.filter((c) => c.supertype === "Energy");

  // --- FIX: Map string cardId to integer id for Pokémon ---
  let cardIdToInt: Record<string, number> = {};
  if (pokemonCards.length > 0) {
    const cardIds = pokemonCards.map((c) => c.cardId);
    const placeholders = cardIds.map(() => "?").join(", ");
    try {
      const cardRows = await db.getAllAsync<{ cardId: string; id: number }>(
        `SELECT cardId, id FROM Card WHERE cardId IN (${placeholders})`,
        cardIds
      );
      if (cardRows) {
        for (const row of cardRows) {
          cardIdToInt[row.cardId] = row.id;
        }
      }
    } catch (error) {
      console.error("Error fetching card IDs from SQLite:", error);
    }
  }

  // Fetch all attacks for Pokémon cards using integer id
  let attacksMap: Record<string, string> = {};
  if (pokemonCards.length > 0 && Object.keys(cardIdToInt).length > 0) {
    const intIds = Object.values(cardIdToInt);
    const placeholders = intIds.map(() => "?").join(", ");
    try {
      const cardAttacks = await db.getAllAsync<{ cardId: number; attackId: number; cost: string; damage: string }>(
        `SELECT cardId, attackId, cost, damage FROM CardAttacks WHERE cardId IN (${placeholders})`,
        intIds
      );

      if (cardAttacks) {
        // Fetch attack names for all attackIds
        const attackIds = Array.from(new Set(cardAttacks.map((a) => a.attackId)));
        let attackNameMap: Record<string, string> = {};
        if (attackIds.length > 0) {
          const attackPlaceholders = attackIds.map(() => "?").join(", ");
          const attacksData = await db.getAllAsync<{ id: number; name: string }>(
            `SELECT id, name FROM Attacks WHERE id IN (${attackPlaceholders})`,
            attackIds
          );
          if (attacksData) {
            for (const a of attacksData) {
              attackNameMap[a.id] = a.name;
            }
          }
        }
        // Group attacks by cardId (int)
        const grouped: Record<number, any[]> = {};
        for (const row of cardAttacks) {
          if (!grouped[row.cardId]) grouped[row.cardId] = [];
          grouped[row.cardId].push(row);
        }
        // For each card, build a normalized string of attacks (name|damage|cost)
        for (const card of pokemonCards) {
          const intId = cardIdToInt[card.cardId];
          const attacks = grouped[intId] || [];
          const attackStrings = attacks.map((a) => {
            const cost = a.cost ? JSON.stringify([...JSON.parse(a.cost)].sort()) : "";
            const name = attackNameMap[a.attackId] || "";
            return `${name}|${a.damage || ""}|${cost}`;
          });
          attacksMap[card.cardId] = attackStrings.sort().join("||");
        }
      }
    } catch (error) {
      console.error("Error fetching attacks from SQLite:", error);
    }
  }

  // Fetch all rules for Trainer and Energy cards
  let rulesMap: Record<string, string> = {};
  const allTrainerEnergy = [...trainerCards, ...energyCards];
  if (allTrainerEnergy.length > 0) {
    const cardIds = allTrainerEnergy.map((c) => c.cardId);
    const placeholders = cardIds.map(() => "?").join(", ");
    try {
      const rows = await db.getAllAsync<{ cardId: string; rules: string | null }>(
        `SELECT cardId, rules FROM Card WHERE cardId IN (${placeholders})`,
        cardIds
      );
      if (rows) {
        for (const row of rows) {
          let rule = row.rules || "";
          // If rules is a JSON array, use only the first string
          try {
            const arr = JSON.parse(rule);
            if (Array.isArray(arr) && arr.length > 0) {
              rule = arr[0];
            }
          } catch {
            // Not JSON, use as is
          }
          // Remove ALL whitespace for normalization
          rulesMap[row.cardId] = (rule || "").replace(/\s+/g, "").trim();
        }
      }
    } catch (error) {
      console.error("Error fetching rules from SQLite:", error);
    }
  }

  // Deduplicate
  const seen = new Set();
  const result: any[] = [];
  for (const card of cards) {
    let key = "";
    if (card.supertype === "Pokémon") {
      const attacksKey = attacksMap[card.cardId] || "";
      if (!attacksKey) {
        key = `${card.name}|${card.hp}`;
      } else {
        key = `${card.name}|${card.hp}|${attacksKey}`;
      }
    } else if (card.supertype === "Trainer" || card.supertype === "Energy") {
      // Normalize rules: trim, collapse ALL whitespace (not just collapse to one space), treat null/empty/[] as ""
      let rules = rulesMap[card.cardId];
      if (rules === undefined) {
        // fallback to card.rules if not in rulesMap
        if (Array.isArray(card.rules) && card.rules.length > 0 && typeof card.rules[0] === "string") {
          rules = card.rules[0];
        } else if (typeof card.rules === "string") {
          rules = card.rules;
        } else {
          rules = "";
        }
      }
      // Always normalize as string
      let ruleStr = typeof rules === "string" ? rules : "";
      // Try to parse as JSON array, use first element if string
      try {
        const arr = JSON.parse(ruleStr);
        if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "string") {
          ruleStr = arr[0];
        }
      } catch {}
      // Remove ALL whitespace for normalization
      const normRule = (ruleStr || "").replace(/\s/g, "").trim();
      if (!normRule) {
        key = `${card.name}`;
      } else {
        key = `${card.name}|${normRule}`;
      }
    } else {
      key = card.cardId; // fallback
    }
    if (!seen.has(key)) {
      seen.add(key);
      result.push(card);
    }
  }
  // Sort result alphabetically by name (and hp for Pokémon)
  result.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    if (a.supertype === "Pokémon" && b.supertype === "Pokémon") {
      // If same name, sort by hp
      return (parseInt(a.hp) || 0) - (parseInt(b.hp) || 0);
    }
    return 0;
  });
  return result;
}
