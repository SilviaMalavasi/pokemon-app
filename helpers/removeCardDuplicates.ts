import { supabase } from "@/lib/supabase";

/**
 * Remove duplicate cards from a list of card objects according to Pokémon TCG rules.
 * - For Pokémon: duplicates have same name, hp, and set of attacks (name, damage, cost)
 * - For Trainer: duplicates have same name and rules
 * - For Energy: never deduplicate
 * @param cards Array of card objects (must include cardId, name, supertype, hp, rules)
 * @returns Array of unique card objects
 */
export async function removeCardDuplicates(cards: any[]): Promise<any[]> {
  // Separate cards by supertype
  const pokemonCards = cards.filter((c) => c.supertype === "Pokémon");
  const trainerCards = cards.filter((c) => c.supertype === "Trainer");

  // --- FIX: Map string cardId to integer id for Pokémon ---
  let cardIdToInt: Record<string, number> = {};
  if (pokemonCards.length > 0) {
    const { data: cardRows, error: cardRowsError } = await supabase
      .from("Card")
      .select("cardId, id")
      .in(
        "cardId",
        pokemonCards.map((c) => c.cardId)
      );
    if (!cardRowsError && cardRows) {
      for (const row of cardRows) {
        cardIdToInt[row.cardId] = row.id;
      }
    }
  }

  // Fetch all attacks for Pokémon cards using integer id
  let attacksMap: Record<string, string> = {};
  if (pokemonCards.length > 0 && Object.keys(cardIdToInt).length > 0) {
    const intIds = Object.values(cardIdToInt);
    const { data: cardAttacks, error } = await supabase
      .from("CardAttacks")
      .select("cardId, attackId, cost, damage")
      .in("cardId", intIds);
    if (!error && cardAttacks) {
      // Fetch attack names for all attackIds
      const attackIds = Array.from(new Set(cardAttacks.map((a) => a.attackId)));
      let attackNameMap: Record<string, string> = {};
      if (attackIds.length > 0) {
        const { data: attacksData } = await supabase.from("Attacks").select("id, name").in("id", attackIds);
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
  }

  // Fetch all rules for Trainer cards
  let trainerRulesMap: Record<string, string> = {};
  if (trainerCards.length > 0) {
    const { data: trainerRows, error: trainerRowsError } = await supabase
      .from("Card")
      .select("cardId, rules")
      .in(
        "cardId",
        trainerCards.map((c) => c.cardId)
      );
    if (!trainerRowsError && trainerRows) {
      for (const row of trainerRows) {
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
        trainerRulesMap[row.cardId] = (rule || "").replace(/\s+/g, " ").trim();
      }
    }
  }

  // Deduplicate
  const seen = new Set();
  const result: any[] = [];
  for (const card of cards) {
    let key = "";
    if (card.supertype === "Pokémon") {
      key = `${card.name}|${card.hp}|${attacksMap[card.cardId] || ""}`;
    } else if (card.supertype === "Trainer") {
      const rules = trainerRulesMap[card.cardId] || (card.rules ? card.rules.trim() : "");
      key = `${card.name}|${rules}`;
    } else {
      key = card.cardId; // Energy: never deduplicate
    }
    if (!seen.has(key)) {
      seen.add(key);
      result.push(card);
    }
  }
  return result;
}
