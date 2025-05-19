// Group and order cards in a deck by supertype and evolution lines
// Used by DeckThumbnailList
export interface CardData {
  cardId: string;
  quantity: number;
  name?: string;
  imagesLarge?: string;
  supertype?: string;
  subtypes?: string[];
  evolvesTo?: string[] | string;
  evolvesFrom?: string;
}

export interface CardDataMap {
  [id: string]: { name: string; supertype: string; subtypes: string[] };
}

// Change GroupedCards to use CardData[] for Pokémon, not CardData[][]
export interface GroupedCards {
  Pokémon: CardData[];
  Trainer: CardData[];
  Energy: CardData[];
}

export function orderCardsInDeck(cards: CardData[], cardDataMap: CardDataMap, cardDb?: any): GroupedCards {
  const groups: GroupedCards = {
    Pokémon: [],
    Trainer: [],
    Energy: [],
  };
  (cards || []).forEach((card) => {
    const dbData = cardDataMap[card.cardId];
    let supertype: string | undefined = undefined;
    let subtypes: string[] = [];
    let evolvesFrom = card.evolvesFrom;
    let evolvesTo = card.evolvesTo;
    // Try to get evolvesFrom/evolvesTo from db if missing
    if ((!evolvesFrom || !evolvesTo) && cardDb) {
      // Synchronously not possible, but if cardDb is a map, use it
      const dbCard = cardDb[card.cardId];
      if (dbCard) {
        if (!evolvesFrom && dbCard.evolvesFrom) evolvesFrom = dbCard.evolvesFrom;
        if (!evolvesTo && dbCard.evolvesTo) evolvesTo = dbCard.evolvesTo;
      }
    }
    if (dbData) {
      // Parse supertype
      if (Array.isArray(dbData.supertype)) {
        supertype = dbData.supertype[0];
      } else if (typeof dbData.supertype === "string") {
        try {
          const arr = JSON.parse(dbData.supertype);
          if (Array.isArray(arr) && arr.length > 0) {
            supertype = arr[0];
          } else {
            supertype = dbData.supertype;
          }
        } catch {
          supertype = dbData.supertype;
        }
      }
      // Parse subtypes
      if (Array.isArray(dbData.subtypes)) {
        subtypes = dbData.subtypes;
      } else if (typeof dbData.subtypes === "string") {
        try {
          const arr = JSON.parse(dbData.subtypes);
          if (Array.isArray(arr)) subtypes = arr;
          else if (arr) subtypes = [arr];
        } catch {
          if (typeof dbData.subtypes === "string" && String(dbData.subtypes).trim() !== "")
            subtypes = [String(dbData.subtypes)];
        }
      }
    }
    // Attach subtypes and evolvesFrom/evolvesTo for sorting
    const cardWithSubtypes = { ...card, subtypes, evolvesFrom, evolvesTo };
    if (supertype === "Pokémon") groups["Pokémon"].push(cardWithSubtypes);
    else if (supertype === "Trainer") groups["Trainer"].push(cardWithSubtypes);
    else if (supertype === "Energy") groups["Energy"].push(cardWithSubtypes);
    // Ignore others
  });
  // Sort Trainer by first subtype alphabetically
  groups["Trainer"].sort((a, b) => {
    const aSub = a.subtypes?.[0] || "";
    const bSub = b.subtypes?.[0] || "";
    return aSub.localeCompare(bSub);
  });
  // Sort Energy: non-Basic first (by subtype), then Basic at the end
  groups["Energy"].sort((a, b) => {
    const aIsBasic = a.subtypes?.includes("Basic");
    const bIsBasic = b.subtypes?.includes("Basic");
    if (aIsBasic && !bIsBasic) return 1;
    if (!aIsBasic && bIsBasic) return -1;
    const aSub = a.subtypes?.[0] || "";
    const bSub = b.subtypes?.[0] || "";
    return aSub.localeCompare(bSub);
  });
  // --- Pokémon grouping: group by evolvesFrom only, preserve group structure for output ---
  const pokemon = groups["Pokémon"];
  const used = new Set<string>();
  const lines: CardData[][] = [];

  function getStage(card: CardData): number {
    if (card.subtypes?.includes("Basic")) return 0;
    if (card.subtypes?.includes("Stage 1")) return 1;
    if (card.subtypes?.includes("Stage 2")) return 2;
    return 99;
  }

  // 1. Group Basics (by quantity desc)
  let basics = pokemon.filter((c) => getStage(c) === 0);
  basics.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

  // Each basic starts a group
  for (const basic of basics) {
    lines.push([basic]);
    used.add(basic.cardId);
  }

  // 2. Assign Stage 1 to group by evolvesFrom
  let stage1s = pokemon.filter((c) => getStage(c) === 1);

  for (const stage1 of stage1s) {
    let assigned = false;
    for (const group of lines) {
      const basic = group[0];
      if (
        stage1.evolvesFrom &&
        basic &&
        (basic.name || "").trim().toLowerCase() === stage1.evolvesFrom.trim().toLowerCase()
      ) {
        group.push(stage1);
        used.add(stage1.cardId);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      lines.push([stage1]);
      used.add(stage1.cardId);
    }
  }

  // 3. Assign Stage 2 to group by evolvesFrom (should match a Stage 1 in a group)
  let stage2s = pokemon.filter((c) => getStage(c) === 2);

  for (const stage2 of stage2s) {
    let assigned = false;
    for (const group of lines) {
      const stage1 = group.find((c) => getStage(c) === 1);
      if (
        stage2.evolvesFrom &&
        stage1 &&
        (stage1.name || "").trim().toLowerCase() === stage2.evolvesFrom.trim().toLowerCase()
      ) {
        group.push(stage2);
        used.add(stage2.cardId);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      lines.push([stage2]);
      used.add(stage2.cardId);
    }
  }

  // 4. Add any remaining Pokémon as single-card lines
  let remaining = pokemon.filter((c) => !used.has(c.cardId));
  if (remaining.length > 0) {
  }
  remaining.forEach((c) => {
    if (!used.has(c.cardId)) {
      lines.push([c]);
      used.add(c.cardId);
    }
  });

  // Return Pokémon as a flat array, not grouped
  (groups as any)["Pokémon"] = lines.flat();
  return groups as unknown as {
    Pokémon: CardData[];
    Trainer: CardData[];
    Energy: CardData[];
  };
}
