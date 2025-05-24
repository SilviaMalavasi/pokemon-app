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
    expect(cardIds).toContain(row.cardId);
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
});
