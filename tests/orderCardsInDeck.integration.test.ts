import { orderCardsInDeck, CardData, CardDataMap } from "../helpers/orderCardsInDeck";
import path from "path";
import fs from "fs";

describe("orderCardsInDeck integration (real Card.json data)", () => {
  const CARD_JSON_PATH = path.resolve(__dirname, "../assets/database/Card.json");
  let cardJson: any[];
  beforeAll(() => {
    const raw = fs.readFileSync(CARD_JSON_PATH, "utf-8");
    cardJson = JSON.parse(raw);
  });

  function getRandomCards(cards: any[], filter: (c: any) => boolean, count: number) {
    const filtered = cards.filter(filter);
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered.slice(0, count);
  }

  it("groups and sorts a real deck with Pokémon, Trainers, and Energy from Card.json", () => {
    // Defensive: ensure Card.json has the required fields
    const hasFields = (c: any) => typeof c.name === "string" && typeof c.supertype === "string";
    const pokemons = getRandomCards(cardJson, (c) => hasFields(c) && c.supertype === "Pokémon", 30);
    const trainers = getRandomCards(cardJson, (c) => hasFields(c) && c.supertype === "Trainer", 20);
    const energies = getRandomCards(cardJson, (c) => hasFields(c) && c.supertype === "Energy", 10);
    const all = [...pokemons, ...trainers, ...energies];
    // Assign quantities for test
    const cards: CardData[] = all.map((c: any, i: number) => ({
      cardId: c.cardId || `test-${i}`,
      quantity: 1,
      name: String(c.name),
      supertype: String(c.supertype),
      subtypes: Array.isArray(c.subtypes) ? c.subtypes : typeof c.subtypes === "string" ? [c.subtypes] : [],
      evolvesFrom: c.evolvesFrom || undefined,
      evolvesTo: c.evolvesTo || undefined,
    }));
    // Build cardDataMap
    const cardDataMap: CardDataMap = {};
    for (const c of cards) {
      cardDataMap[c.cardId] = {
        name: String(c.name),
        supertype: String(c.supertype),
        subtypes: c.subtypes || [],
      };
    }
    const grouped = orderCardsInDeck(cards, cardDataMap);
    // Assert grouping
    expect(Object.keys(grouped)).toEqual(expect.arrayContaining(["Pokémon", "Trainer", "Energy"]));
    expect(grouped.Pokémon.length).toBeGreaterThan(0);
    expect(grouped.Trainer.length).toBeGreaterThan(0);
    expect(grouped.Energy.length).toBeGreaterThan(0);
    // Check sorting within groups
    const groupNames: Array<keyof typeof grouped> = ["Pokémon", "Trainer", "Energy"];
    for (const group of groupNames) {
      if (group === "Pokémon") {
        // For Pokémon, check that all Basic come before Stage 1, which come before Stage 2, etc.
        const stageOrder = ["Basic", "Stage 1", "Stage 2"];
        const pokes = grouped.Pokémon;
        // 1. All Basics before Stage 1, all Stage 1 before Stage 2 (global)
        const stages = pokes.map((c: any) => {
          if (Array.isArray(c.subtypes)) {
            if (c.subtypes.includes("Basic")) return "Basic";
            if (c.subtypes.includes("Stage 1")) return "Stage 1";
            if (c.subtypes.includes("Stage 2")) return "Stage 2";
          }
          return "Other";
        });
        let lastStageIndex = -1;
        for (const stage of stages) {
          const idx = stageOrder.indexOf(stage);
          if (idx === -1) continue; // skip "Other"
          expect(idx).toBeGreaterThanOrEqual(lastStageIndex);
          lastStageIndex = idx;
        }
        // 2. For each evolution line, ensure order is Basic -> Stage 1 -> Stage 2
        // Build a map: { [evolutionRoot]: [cards in line] }
        const evoLines: Record<string, any[]> = {};
        for (const card of pokes) {
          // Find root: walk up evolvesFrom until undefined
          let root: string = String(card.name || "unknown");
          let current = card;
          const nameToCard = Object.fromEntries(pokes.map((c: any) => [c.name, c]));
          while (current.evolvesFrom && nameToCard[current.evolvesFrom]) {
            current = nameToCard[current.evolvesFrom];
            root = String(current.name || card.name || "unknown");
          }
          if (!root) root = String(card.name || "unknown");
          if (!evoLines[root]) evoLines[root] = [];
          evoLines[root].push(card);
        }
        for (const [root, line] of Object.entries(evoLines)) {
          // Sort by appearance in pokes (deck order)
          const lineInOrder = line.sort((a, b) => pokes.indexOf(a) - pokes.indexOf(b));
          // Get stage for each
          const lineStages = lineInOrder.map((c: any) => {
            if (Array.isArray(c.subtypes)) {
              if (c.subtypes.includes("Basic")) return "Basic";
              if (c.subtypes.includes("Stage 1")) return "Stage 1";
              if (c.subtypes.includes("Stage 2")) return "Stage 2";
            }
            return "Other";
          });
          // Should be non-decreasing in stageOrder
          let lastIdx = -1;
          for (const stage of lineStages) {
            const idx = stageOrder.indexOf(stage);
            if (idx === -1) continue;
            expect(idx).toBeGreaterThanOrEqual(lastIdx);
            lastIdx = idx;
          }
        }
      } else {
        // For Trainer and Energy, just check non-empty
        expect(grouped[group].length).toBeGreaterThan(0);
      }
    }
  });
});
