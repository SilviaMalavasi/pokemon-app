import { queryBuilder, QueryBuilderFilter } from "../helpers/queryBuilder";
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(__dirname, "../scripts/db/pokemonCardsDB.db");

describe("queryBuilder integration (real card database)", () => {
  let db: any;
  beforeAll(() => {
    db = new Database(DB_PATH, { readonly: true });
    // Patch db.getAllAsync to match expo-sqlite API
    db.getAllAsync = (sql: string, ...params: any[]) => {
      return Promise.resolve(db.prepare(sql).all(...params));
    };
  });

  afterAll(() => {
    db.close();
  });

  it("returns no cards when no filters are applied", async () => {
    const { cardIds, query } = await queryBuilder(db, []);
    expect(Array.isArray(cardIds)).toBe(true);
    expect(cardIds.length).toBe(0);
    expect(typeof query).toBe("string");
  });

  it("filters by card name (text)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "Card",
          column: "name",
        },
        value: "Pikachu",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    // All returned cards should have 'Pikachu' in their name
    const names = await db.getAllAsync(
      `SELECT name FROM Card WHERE cardId IN (${cardIds.map(() => "?").join(", ")})`,
      ...cardIds
    );
    for (const row of names as any[]) {
      expect((row as any).name).toMatch(/Pikachu/i);
    }
  });

  it("filters by HP >= 100 (number)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "hp",
          type: "number",
          table: "Card",
          column: "hp",
          valueType: "int",
        },
        value: 100,
        operator: ">=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    const hps = await db.getAllAsync(
      `SELECT hp FROM Card WHERE cardId IN (${cardIds.map(() => "?").join(", ")})`,
      ...cardIds
    );
    for (const row of hps as any[]) {
      expect((row as any).hp).toBeGreaterThanOrEqual(100);
    }
  });

  it("filters by set name (CardSet)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "CardSet",
          column: "name",
        },
        value: "Scarlet & Violet",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    // All returned cards should belong to a set with 'Scarlet & Violet' in the name
    const sets = await db.getAllAsync(
      `SELECT CardSet.name FROM Card JOIN CardSet ON Card.setId = CardSet.id WHERE Card.cardId IN (${cardIds
        .map(() => "?")
        .join(", ")})`,
      ...cardIds
    );
    for (const row of sets as any[]) {
      expect((row as any).name).toMatch(/Scarlet & Violet/i);
    }
  });

  it("debug: print all CardSet names", () => {
    const sets = db.prepare("SELECT name FROM CardSet").all();
    // eslint-disable-next-line no-console
    console.log(
      "All CardSet names:",
      sets.map((s: any) => s.name)
    );
    expect(Array.isArray(sets)).toBe(true);
  });

  it("filters by a real set name and finds associated cards (dynamic test)", async () => {
    // Get a real CardSet name and id
    const setRow = db.prepare("SELECT id, name FROM CardSet LIMIT 1").get();
    expect(setRow).toBeDefined();
    // Find a card in that set
    const cardRow = db.prepare("SELECT cardId, name FROM Card WHERE setId = ? LIMIT 1").get(setRow.id);
    expect(cardRow).toBeDefined();

    // Now test queryBuilder with this set name
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "CardSet",
          column: "name",
        },
        value: setRow.name,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    // The card we found above should be in the results
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by flavorText (text, Card)", async () => {
    // Find a card with non-null flavorText
    const cardRow = db
      .prepare("SELECT cardId, flavorText FROM Card WHERE flavorText IS NOT NULL AND flavorText != '' LIMIT 1")
      .get();
    expect(cardRow).toBeDefined();
    const flavorWord = (cardRow.flavorText as string).split(/\s+/)[0];
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "flavorText",
          type: "text",
          table: "Card",
          column: "flavorText",
        },
        value: flavorWord,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by rarity (multiselect, Card)", async () => {
    // Find two rarities
    const rarities = db
      .prepare("SELECT DISTINCT rarity FROM Card WHERE rarity IS NOT NULL AND rarity != '' LIMIT 2")
      .all()
      .map((r: any) => r.rarity);
    expect(rarities.length).toBeGreaterThan(0);
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "rarity",
          type: "multiselect",
          table: "Card",
          column: "rarity",
          valueType: "json-string-array",
        },
        value: rarities,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    // All returned cards should have one of the selected rarities
    const foundRarities = await db.getAllAsync(
      `SELECT rarity FROM Card WHERE cardId IN (${cardIds.map(() => "?").join(", ")})`,
      ...cardIds
    );
    for (const row of foundRarities as any[]) {
      expect(rarities).toContain((row as any).rarity);
    }
  });

  it("filters by HP <= 60 (number, operator <=)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "hp",
          type: "number",
          table: "Card",
          column: "hp",
          valueType: "int",
        },
        value: 60,
        operator: "<=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    const hps = await db.getAllAsync(
      `SELECT hp FROM Card WHERE cardId IN (${cardIds.map(() => "?").join(", ")})`,
      ...cardIds
    );
    for (const row of hps as any[]) {
      expect((row as any).hp).toBeLessThanOrEqual(60);
    }
  });

  it("filters by CardAbilities exists (has any ability)", async () => {
    // Check if there are any cards with abilities in the DB
    const caRows = db.prepare("SELECT DISTINCT cardId FROM CardAbilities").all();
    if (caRows.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("No cards with abilities in the database, skipping test.");
      return;
    }
    const abilityCardIds = caRows.map((row: any) => row.cardId);
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "hasAbility",
          type: "exists",
          table: "CardAbilities",
          column: "cardId",
        },
        value: true,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    // Map string cardIds to numeric Card.id
    const cardIdRows = db
      .prepare(`SELECT cardId, id FROM Card WHERE cardId IN (${cardIds.map(() => "?").join(", ")})`)
      .all(...cardIds);
    const cardIdMap = new Map(cardIdRows.map((row: any) => [row.cardId, row.id]));
    for (const cardId of cardIds) {
      const numericId = cardIdMap.get(cardId);
      expect(abilityCardIds).toContain(numericId);
    }
  });

  it("filters by AND logic (name and rarity)", async () => {
    // Find a card with a rarity and a name
    const cardRow = db
      .prepare("SELECT cardId, name, rarity FROM Card WHERE rarity IS NOT NULL AND rarity != '' LIMIT 1")
      .get();
    expect(cardRow).toBeDefined();
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "Card",
          column: "name",
        },
        value: cardRow.name,
      },
      {
        config: {
          key: "rarity",
          type: "multiselect",
          table: "Card",
          column: "rarity",
          valueType: "json-string-array",
        },
        value: [cardRow.rarity],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by OR logic (name or rarity)", async () => {
    // Find two cards with different names and rarities
    const cards = db
      .prepare("SELECT cardId, name, rarity FROM Card WHERE rarity IS NOT NULL AND rarity != '' LIMIT 2")
      .all();
    expect(cards.length).toBe(2);
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "Card",
          column: "name",
          logic: "or",
        },
        value: cards[0].name,
      },
      {
        config: {
          key: "rarity",
          type: "multiselect",
          table: "Card",
          column: "rarity",
          valueType: "json-string-array",
          logic: "or",
        },
        value: [cards[1].rarity],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toEqual(expect.arrayContaining([cards[0].cardId, cards[1].cardId]));
  });

  it("filters by attack damage >= 50 (text-numeric filter on text column)", async () => {
    // Find an attack with numeric damage stored as text
    const attackRow = db
      .prepare(
        "SELECT Card.cardId, Card.name, CardAttacks.damage FROM CardAttacks JOIN Card ON Card.id = CardAttacks.cardId WHERE CardAttacks.damage GLOB '[0-9]*' LIMIT 1"
      )
      .get();
    if (!attackRow) return;
    const numericDamage = parseInt((attackRow.damage as string).replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericDamage)) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "damage",
          type: "number",
          table: "CardAttacks",
          column: "damage",
          valueType: "text",
        },
        value: numericDamage,
        operator: ">=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(attackRow.cardId);
  });

  it("filters by attack damage with 'x' or '+' operator (special text-numeric)", async () => {
    // Find an attack with damage ending in 'x' or '+'
    const attackRow = db
      .prepare(
        "SELECT Card.cardId, Card.name, CardAttacks.damage FROM CardAttacks JOIN Card ON Card.id = CardAttacks.cardId WHERE CardAttacks.damage LIKE '%x' OR CardAttacks.damage LIKE '%+' LIMIT 1"
      )
      .get();
    if (!attackRow) return;
    const base = (attackRow.damage as string).replace(/[^0-9]/g, "");
    const op = (attackRow.damage as string).endsWith("x")
      ? "x"
      : (attackRow.damage as string).endsWith("+")
      ? "+"
      : undefined;
    if (!op) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "damage",
          type: "number",
          table: "CardAttacks",
          column: "damage",
          valueType: "text",
        },
        value: base,
        operator: op,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(attackRow.cardId);
  });

  it("filters by attack name (join CardAttacks/Attacks)", async () => {
    // Find an attack name
    const attackRow = db
      .prepare(
        "SELECT Card.cardId, Attacks.name FROM CardAttacks JOIN Card ON Card.id = CardAttacks.cardId JOIN Attacks ON CardAttacks.attackId = Attacks.id WHERE Attacks.name IS NOT NULL LIMIT 1"
      )
      .get();
    if (!attackRow) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "Attacks",
          column: "name",
        },
        value: attackRow.name,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(attackRow.cardId);
  });

  it("filters by attack cost and slots (special case)", async () => {
    // Find a CardAttack with a cost array and convertedEnergyCost
    const row = db
      .prepare(
        "SELECT cardId, cost, convertedEnergyCost FROM CardAttacks WHERE cost IS NOT NULL AND convertedEnergyCost IS NOT NULL LIMIT 1"
      )
      .get();
    if (!row) return;
    let costArr: string[] = [];
    try {
      costArr = JSON.parse(row.cost);
    } catch {
      return;
    }
    if (!Array.isArray(costArr) || costArr.length === 0) return;
    // Debug log
    // eslint-disable-next-line no-console
    console.log("Test row:", row.cardId, row.convertedEnergyCost, costArr);
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "convertedEnergyCost",
          type: "number",
          table: "CardAttacks",
          column: "convertedEnergyCost",
          valueType: "int",
        },
        value: row.convertedEnergyCost,
        operator: "=",
      },
      {
        config: {
          key: "costSlots",
          type: "multiselect",
          table: "CardAttacks",
          column: "cost",
          valueType: "json-string-array",
        },
        value: costArr,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    // Map numeric Card.id to string Card.cardId for assertion
    const cardIdRow = db.prepare("SELECT cardId FROM Card WHERE id = ?").get(row.cardId);
    const stringCardId = cardIdRow ? cardIdRow.cardId : null;
    // eslint-disable-next-line no-console
    console.log("String Card.cardId for assertion:", stringCardId);
    expect(cardIds).toContain(stringCardId);
  });

  it("filters by multiple words in text (AND within field)", async () => {
    // Find a card name with at least two words
    const cardRow = db.prepare("SELECT cardId, name FROM Card WHERE name LIKE '% %' LIMIT 1").get();
    if (!cardRow) return;
    const words = (cardRow.name as string).split(/\s+/).filter(Boolean);
    if (words.length < 2) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "Card",
          column: "name",
        },
        value: cardRow.name,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("returns no cards for impossible filter (edge case)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "Card",
          column: "name",
        },
        value: "DefinitelyNotARealCardName12345",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBe(0);
  });

  it("filters by card name case-insensitively", async () => {
    // Find a card with a lowercase name
    const cardRow = db.prepare("SELECT cardId, name FROM Card WHERE name IS NOT NULL AND name != '' LIMIT 1").get();
    if (!cardRow) return;
    const lowerName = (cardRow.name as string).toLowerCase();
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "name",
          type: "text",
          table: "Card",
          column: "name",
        },
        value: lowerName,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by partial match in rarity (multiselect)", async () => {
    // Find a rarity containing 'Rare'
    const row = db.prepare("SELECT DISTINCT rarity FROM Card WHERE rarity LIKE '%Rare%' LIMIT 1").get();
    if (!row) return;
    const partial = "Rare";
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "rarity",
          type: "multiselect",
          table: "Card",
          column: "rarity",
          valueType: "json-string-array",
        },
        value: [partial],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    // All returned cards should have rarity containing 'Rare'
    const foundRarities = await db.getAllAsync(
      `SELECT rarity FROM Card WHERE cardId IN (${cardIds.map(() => "?").join(", ")})`,
      ...cardIds
    );
    for (const r of foundRarities as any[]) {
      expect((r as any).rarity).toMatch(/Rare/);
    }
  });

  it("filters by HP range (>= 60 and <= 120)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "hp",
          type: "number",
          table: "Card",
          column: "hp",
          valueType: "int",
        },
        value: 60,
        operator: ">=",
      },
      {
        config: {
          key: "hp",
          type: "number",
          table: "Card",
          column: "hp",
          valueType: "int",
        },
        value: 120,
        operator: "<=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
    const hps = await db.getAllAsync(
      `SELECT hp FROM Card WHERE cardId IN (${cardIds.map(() => "?").join(", ")})`,
      ...cardIds
    );
    for (const row of hps as any[]) {
      expect((row as any).hp).toBeGreaterThanOrEqual(60);
      expect((row as any).hp).toBeLessThanOrEqual(120);
    }
  });

  it("filters by type (json-string-array field)", async () => {
    // Find a type
    const row = db.prepare("SELECT types FROM Card WHERE types IS NOT NULL AND types != '' LIMIT 1").get();
    if (!row) return;
    let types: string[] = [];
    try {
      types = JSON.parse(row.types);
    } catch {
      return;
    }
    if (!Array.isArray(types) || types.length === 0) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "types",
          type: "multiselect",
          table: "Card",
          column: "types",
          valueType: "json-string-array",
        },
        value: [types[0]],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBeGreaterThan(0);
  });

  it("filters by attack text (join Attacks.text)", async () => {
    // Find an attack with text
    const attackRow = db
      .prepare(
        "SELECT Card.cardId, Attacks.text FROM CardAttacks JOIN Card ON Card.id = CardAttacks.cardId JOIN Attacks ON CardAttacks.attackId = Attacks.id WHERE Attacks.text IS NOT NULL AND Attacks.text != '' LIMIT 1"
      )
      .get();
    if (!attackRow) return;
    const word = (attackRow.text as string).split(/\s+/)[0];
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "text",
          type: "text",
          table: "Attacks",
          column: "text",
        },
        value: word,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(attackRow.cardId);
  });

  it("filters by multiple attack filters (AND logic on attacks)", async () => {
    // Find a card with at least two different attacks
    const cardRow = db
      .prepare(
        `SELECT Card.cardId, Card.name, GROUP_CONCAT(Attacks.name) as attackNames
      FROM Card
      JOIN CardAttacks ON Card.id = CardAttacks.cardId
      JOIN Attacks ON CardAttacks.attackId = Attacks.id
      GROUP BY Card.cardId HAVING COUNT(Attacks.name) >= 2 LIMIT 1`
      )
      .get();
    if (!cardRow) return;
    const attackNames = (cardRow.attackNames as string).split(",");
    if (attackNames.length < 2) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "name", type: "text", table: "Attacks", column: "name" },
        value: attackNames[0],
      },
      {
        config: { key: "name", type: "text", table: "Attacks", column: "name" },
        value: attackNames[1],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by multiple types (OR logic on json-string-array)", async () => {
    // Find a card with at least two types
    const row = db.prepare("SELECT cardId, types FROM Card WHERE types IS NOT NULL AND types != '' LIMIT 1").get();
    if (!row) return;
    let types: string[] = [];
    try {
      types = JSON.parse(row.types);
    } catch {
      return;
    }
    if (types.length < 2) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "types",
          type: "multiselect",
          table: "Card",
          column: "types",
          valueType: "json-string-array",
          logic: "or",
        },
        value: [types[0], types[1]],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(row.cardId);
  });

  it("filters by subtype (json-string-array field)", async () => {
    // Find a card with at least one subtype
    const row = db
      .prepare("SELECT cardId, subtypes FROM Card WHERE subtypes IS NOT NULL AND subtypes != '' LIMIT 1")
      .get();
    if (!row) return;
    let subtypes: string[] = [];
    try {
      subtypes = JSON.parse(row.subtypes);
    } catch {
      return;
    }
    if (!Array.isArray(subtypes) || subtypes.length === 0) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "subtypes",
          type: "multiselect",
          table: "Card",
          column: "subtypes",
          valueType: "json-string-array",
        },
        value: [subtypes[0]],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(row.cardId);
  });

  it("filters by attack with multiple cost slots (partial match)", async () => {
    // Find a CardAttack with a cost array of at least 2 slots
    const row = db.prepare("SELECT cardId, cost FROM CardAttacks WHERE cost IS NOT NULL LIMIT 1").get();
    if (!row) return;
    let costArr: string[] = [];
    try {
      costArr = JSON.parse(row.cost);
    } catch {
      return;
    }
    if (costArr.length < 2) return;
    // Use only the first slot for partial match
    const filters: QueryBuilderFilter[] = [
      {
        config: {
          key: "costSlots",
          type: "multiselect",
          table: "CardAttacks",
          column: "cost",
          valueType: "json-string-array",
        },
        value: [costArr[0]],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    // Map numeric Card.id to string Card.cardId for assertion
    const cardIdRow = db.prepare("SELECT cardId FROM Card WHERE id = ?").get(row.cardId);
    const stringCardId = cardIdRow ? cardIdRow.cardId : null;
    expect(cardIds).toContain(stringCardId);
  });

  it("filters by attack text containing multiple words (AND within Attacks.text)", async () => {
    // Find an attack with text containing at least two words
    const attackRow = db
      .prepare(
        "SELECT Card.cardId, Attacks.text FROM CardAttacks JOIN Card ON Card.id = CardAttacks.cardId JOIN Attacks ON CardAttacks.attackId = Attacks.id WHERE Attacks.text LIKE '% %' LIMIT 1"
      )
      .get();
    if (!attackRow) return;
    const words = (attackRow.text as string).split(/\s+/).filter(Boolean);
    if (words.length < 2) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "text", type: "text", table: "Attacks", column: "text" },
        value: words.slice(0, 2).join(" "),
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(attackRow.cardId);
  });

  it("filters by card with both ability and attack filter", async () => {
    // Find a card with at least one ability and one attack
    const cardRow = db
      .prepare(
        `SELECT Card.cardId, Card.name,
          (SELECT name FROM Attacks JOIN CardAttacks ON Attacks.id = CardAttacks.attackId WHERE CardAttacks.cardId = Card.id LIMIT 1) as attackName,
          (SELECT Abilities.name FROM Abilities JOIN CardAbilities ON Abilities.id = CardAbilities.abilityId WHERE CardAbilities.cardId = Card.id LIMIT 1) as abilityName
        FROM Card
        WHERE EXISTS (SELECT 1 FROM CardAbilities WHERE CardAbilities.cardId = Card.id)
          AND EXISTS (SELECT 1 FROM CardAttacks WHERE CardAttacks.cardId = Card.id)
        LIMIT 1`
      )
      .get();
    if (!cardRow || !cardRow.attackName || !cardRow.abilityName) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "name", type: "text", table: "Attacks", column: "name" },
        value: cardRow.attackName,
      },
      {
        config: { key: "name", type: "text", table: "Abilities", column: "name" },
        value: cardRow.abilityName,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("returns no cards for empty array in multiselect (edge case)", async () => {
    // Use a multiselect filter with an empty array
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "types", type: "multiselect", table: "Card", column: "types", valueType: "json-string-array" },
        value: [],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    // Should return no cards, since the filter is ignored and there are no active filters
    expect(cardIds.length).toBe(0);
  });

  // Robust/edge-case tests for Card HP
  it("filters by HP = 0 (edge case)", async () => {
    const cardRow = db.prepare("SELECT cardId, hp FROM Card WHERE hp = 0 LIMIT 1").get();
    if (!cardRow) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
        value: 0,
        operator: "=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by HP very high value (edge case)", async () => {
    const cardRow = db.prepare("SELECT cardId, hp FROM Card WHERE hp >= 300 LIMIT 1").get();
    if (!cardRow) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
        value: cardRow.hp,
        operator: ">=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by HP with invalid operator (should return results for '=' operator, as only valid operators are possible via the UI)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
        value: 100,
        operator: "invalid",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    // The queryBuilder defaults to '=' for unknown operators, so this returns cards with hp = 100
    expect(cardIds.length).toBeGreaterThan(0);
  });

  it("filters by HP as string (should still work if possible)", async () => {
    const cardRow = db.prepare("SELECT cardId, hp FROM Card WHERE hp IS NOT NULL LIMIT 1").get();
    if (!cardRow) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
        value: String(cardRow.hp),
        operator: "=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by HP negative value (should return no cards)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
        value: -10,
        operator: "=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBe(0);
  });

  it("filters by flavorText is null (edge case)", async () => {
    // Skipped: App does not support searching for null flavorText values
  });

  it("filters by flavorText empty string (edge case)", async () => {
    const cardRow = db.prepare("SELECT cardId FROM Card WHERE flavorText = '' LIMIT 1").get();
    if (!cardRow) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "flavorText", type: "text", table: "Card", column: "flavorText" },
        value: "",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by flavorText with special characters", async () => {
    const cardRow = db
      .prepare("SELECT cardId, flavorText FROM Card WHERE flavorText LIKE '%!%' OR flavorText LIKE '%?%' LIMIT 1")
      .get();
    if (!cardRow) return;
    const specialChar = (cardRow.flavorText as string).match(/[!?]/)?.[0] || "!";
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "flavorText", type: "text", table: "Card", column: "flavorText" },
        value: specialChar,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by flavorText with multiple words (AND logic)", async () => {
    const cardRow = db.prepare("SELECT cardId, flavorText FROM Card WHERE flavorText LIKE '% %' LIMIT 1").get();
    if (!cardRow) return;
    const words = (cardRow.flavorText as string).split(/\s+/).filter(Boolean);
    if (words.length < 2) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "flavorText", type: "text", table: "Card", column: "flavorText" },
        value: words.slice(0, 2).join(" "),
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by flavorText case-insensitively", async () => {
    const cardRow = db
      .prepare("SELECT cardId, flavorText FROM Card WHERE flavorText IS NOT NULL AND flavorText != '' LIMIT 1")
      .get();
    if (!cardRow) return;
    const lower = (cardRow.flavorText as string).toLowerCase();
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "flavorText", type: "text", table: "Card", column: "flavorText" },
        value: lower,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("filters by flavorText impossible match (should return no cards)", async () => {
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "flavorText", type: "text", table: "Card", column: "flavorText" },
        value: "DefinitelyNotARealFlavorText12345",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBe(0);
  });

  it("filters by flavorText with partial match", async () => {
    const cardRow = db
      .prepare("SELECT cardId, flavorText FROM Card WHERE flavorText IS NOT NULL AND flavorText != '' LIMIT 1")
      .get();
    if (!cardRow) return;
    const partial = (cardRow.flavorText as string).slice(0, 4);
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "flavorText", type: "text", table: "Card", column: "flavorText" },
        value: partial,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("massive AND/OR combination: name AND rarity OR type", async () => {
    // Get three different values for name, rarity, and type
    const cardRows = db
      .prepare(
        "SELECT cardId, name, rarity, types FROM Card WHERE rarity IS NOT NULL AND rarity != '' AND types IS NOT NULL AND types != '' LIMIT 3"
      )
      .all();
    if (cardRows.length < 3) return;
    let typeArr: string[] = [];
    try {
      typeArr = JSON.parse(cardRows[2].types);
    } catch {}
    if (!Array.isArray(typeArr) || typeArr.length === 0) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "name", type: "text", table: "Card", column: "name" },
        value: cardRows[0].name,
      },
      {
        config: {
          key: "rarity",
          type: "multiselect",
          table: "Card",
          column: "rarity",
          valueType: "json-string-array",
          logic: "or",
        },
        value: [cardRows[1].rarity],
      },
      {
        config: {
          key: "types",
          type: "multiselect",
          table: "Card",
          column: "types",
          valueType: "json-string-array",
          logic: "or",
        },
        value: [typeArr[0]],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    // Should contain at least one of the three cards
    const relevantIds = [cardRows[0].cardId, cardRows[1].cardId, cardRows[2].cardId];
    expect(relevantIds.some((id) => cardIds.includes(id))).toBe(true);
  });

  it("large multiselect: all rarities", async () => {
    const allRarities = db
      .prepare("SELECT DISTINCT rarity FROM Card WHERE rarity IS NOT NULL AND rarity != ''")
      .all()
      .map((r: any) => r.rarity);
    if (allRarities.length < 2) return;
    const filters: QueryBuilderFilter[] = [
      {
        config: { key: "rarity", type: "multiselect", table: "Card", column: "rarity", valueType: "json-string-array" },
        value: allRarities,
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    // Should return a large number of cards
    expect(cardIds.length).toBeGreaterThan(50);
  });

  it("all filters at once (simulate full advanced search)", async () => {
    // Pick a real card with all fields populated
    const cardRow = db
      .prepare(
        "SELECT * FROM Card WHERE rarity IS NOT NULL AND rarity != '' AND types IS NOT NULL AND types != '' AND flavorText IS NOT NULL AND flavorText != '' LIMIT 1"
      )
      .get();
    if (!cardRow) return;
    let types: string[] = [];
    try {
      types = JSON.parse(cardRow.types);
    } catch {}
    if (!Array.isArray(types) || types.length === 0) return;
    const filters: QueryBuilderFilter[] = [
      { config: { key: "name", type: "text", table: "Card", column: "name" }, value: cardRow.name },
      {
        config: { key: "rarity", type: "multiselect", table: "Card", column: "rarity", valueType: "json-string-array" },
        value: [cardRow.rarity],
      },
      {
        config: { key: "types", type: "multiselect", table: "Card", column: "types", valueType: "json-string-array" },
        value: [types[0]],
      },
      {
        config: { key: "flavorText", type: "text", table: "Card", column: "flavorText" },
        value: (cardRow.flavorText as string).split(/\s+/)[0],
      },
      {
        config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
        value: cardRow.hp,
        operator: "=",
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("edge case: many filters, no results", async () => {
    // Generate 10 impossible filters
    const filters: QueryBuilderFilter[] = Array.from({ length: 10 }, (_, i) => ({
      config: { key: "name", type: "text", table: "Card", column: "name" },
      value: `DefinitelyNotARealCardName${i}_${Date.now()}`,
    }));
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBe(0);
  });

  it("stress test: 100+ filters (should not crash)", async () => {
    // Use 100 filters for card names that don't exist
    const filters: QueryBuilderFilter[] = Array.from({ length: 100 }, (_, i) => ({
      config: { key: "name", type: "text", table: "Card", column: "name" },
      value: `FakeName${i}_${Date.now()}`,
    }));
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds.length).toBe(0);
  });

  it("attack + ability + set + hp + rarity + type (all major tables)", async () => {
    // Find a card with all these features
    const cardRow = db
      .prepare(
        `SELECT Card.cardId, Card.name, Card.hp, Card.rarity, Card.types, Card.setId,
      (SELECT name FROM Attacks JOIN CardAttacks ON Attacks.id = CardAttacks.attackId WHERE CardAttacks.cardId = Card.id LIMIT 1) as attackName,
      (SELECT Abilities.name FROM Abilities JOIN CardAbilities ON Abilities.id = CardAbilities.abilityId WHERE CardAbilities.cardId = Card.id LIMIT 1) as abilityName,
      (SELECT name FROM CardSet WHERE CardSet.id = Card.setId) as setName
      FROM Card
      WHERE EXISTS (SELECT 1 FROM CardAbilities WHERE CardAbilities.cardId = Card.id)
        AND EXISTS (SELECT 1 FROM CardAttacks WHERE CardAttacks.cardId = Card.id)
        AND Card.setId IS NOT NULL
        AND Card.rarity IS NOT NULL AND Card.rarity != ''
        AND Card.types IS NOT NULL AND Card.types != ''
      LIMIT 1`
      )
      .get();
    if (!cardRow || !cardRow.attackName || !cardRow.abilityName || !cardRow.setName) return;
    let types: string[] = [];
    try {
      types = JSON.parse(cardRow.types);
    } catch {}
    if (!Array.isArray(types) || types.length === 0) return;
    const filters: QueryBuilderFilter[] = [
      { config: { key: "name", type: "text", table: "Attacks", column: "name" }, value: cardRow.attackName },
      { config: { key: "name", type: "text", table: "Abilities", column: "name" }, value: cardRow.abilityName },
      { config: { key: "name", type: "text", table: "CardSet", column: "name" }, value: cardRow.setName },
      {
        config: { key: "hp", type: "number", table: "Card", column: "hp", valueType: "int" },
        value: cardRow.hp,
        operator: "=",
      },
      {
        config: { key: "rarity", type: "multiselect", table: "Card", column: "rarity", valueType: "json-string-array" },
        value: [cardRow.rarity],
      },
      {
        config: { key: "types", type: "multiselect", table: "Card", column: "types", valueType: "json-string-array" },
        value: [types[0]],
      },
    ];
    const { cardIds } = await queryBuilder(db, filters);
    expect(cardIds).toContain(cardRow.cardId);
  });
});
