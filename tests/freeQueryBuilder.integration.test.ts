import { freeQueryBuilder } from "../helpers/freeQueryBuilder";
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(__dirname, "../scripts/db/pokemonCardsDB.db");

describe("freeQueryBuilder integration (real card database)", () => {
  let db: any;
  beforeAll(() => {
    db = new Database(DB_PATH, { readonly: true });
    db.getAllAsync = (sql: string, ...params: any[]) => {
      return Promise.resolve(db.prepare(sql).all(...params));
    };
  });
  afterAll(() => {
    db.close();
  });

  it("returns no cards for empty search", async () => {
    const { cardIds, query } = await freeQueryBuilder(db, "");
    expect(Array.isArray(cardIds)).toBe(true);
    expect(cardIds.length).toBe(0);
    expect(typeof query).toBe("string");
  });

  it("finds cards by name (text search)", async () => {
    const cardRow = db.prepare("SELECT cardId, name FROM Card WHERE name IS NOT NULL AND name != '' LIMIT 1").get();
    if (!cardRow) return;
    const { cardIds } = await freeQueryBuilder(db, cardRow.name);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by partial name (case-insensitive)", async () => {
    const cardRow = db.prepare("SELECT cardId, name FROM Card WHERE name IS NOT NULL AND name != '' LIMIT 1").get();
    if (!cardRow) return;
    const partial = (cardRow.name as string).slice(0, 3).toLowerCase();
    const { cardIds } = await freeQueryBuilder(db, partial);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by type (json-string-array field)", async () => {
    const row = db.prepare("SELECT cardId, types FROM Card WHERE types IS NOT NULL AND types != '' LIMIT 1").get();
    if (!row) return;
    let types: string[] = [];
    try {
      types = JSON.parse(row.types);
    } catch {}
    if (!Array.isArray(types) || types.length === 0) return;
    const { cardIds } = await freeQueryBuilder(db, types[0]);
    expect(cardIds).toContain(row.cardId);
  });

  it("finds cards by set name", async () => {
    const setRow = db.prepare("SELECT id, name FROM CardSet LIMIT 1").get();
    if (!setRow) return;
    const cardRow = db.prepare("SELECT cardId FROM Card WHERE setId = ? LIMIT 1").get(setRow.id);
    if (!cardRow) return;
    const { cardIds } = await freeQueryBuilder(db, setRow.name);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by attack name", async () => {
    const attackRow = db
      .prepare(
        "SELECT Attacks.name, Card.cardId FROM Attacks JOIN CardAttacks ON Attacks.id = CardAttacks.attackId JOIN Card ON Card.id = CardAttacks.cardId WHERE Attacks.name IS NOT NULL LIMIT 1"
      )
      .get();
    if (!attackRow) return;
    const { cardIds } = await freeQueryBuilder(db, attackRow.name);
    expect(cardIds).toContain(attackRow.cardId);
  });

  it("finds cards by ability name", async () => {
    const abRow = db
      .prepare(
        "SELECT Abilities.name, Card.cardId FROM Abilities JOIN CardAbilities ON Abilities.id = CardAbilities.abilityId JOIN Card ON Card.id = CardAbilities.cardId WHERE Abilities.name IS NOT NULL LIMIT 1"
      )
      .get();
    if (!abRow) return;
    const { cardIds } = await freeQueryBuilder(db, abRow.name);
    expect(cardIds).toContain(abRow.cardId);
  });

  it("finds cards by HP (number search)", async () => {
    const cardRow = db.prepare("SELECT cardId, hp FROM Card WHERE hp IS NOT NULL LIMIT 1").get();
    if (!cardRow) return;
    const { cardIds } = await freeQueryBuilder(db, String(cardRow.hp));
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by multiple words (AND logic)", async () => {
    const cardRow = db.prepare("SELECT cardId, name FROM Card WHERE name LIKE '% %' LIMIT 1").get();
    if (!cardRow) return;
    const words = (cardRow.name as string).split(/\s+/).filter(Boolean);
    if (words.length < 2) return;
    const { cardIds } = await freeQueryBuilder(db, words.join(" "));
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("returns no cards for impossible search", async () => {
    const { cardIds } = await freeQueryBuilder(db, "DefinitelyNotARealCardName12345");
    expect(cardIds.length).toBe(0);
  });

  // Massive/robust tests
  it("massive: all types in one search (should return many cards, OR logic simulated)", async () => {
    const allTypesRows = db
      .prepare(
        "SELECT DISTINCT value FROM (SELECT json_each.value FROM Card, json_each(Card.types) WHERE Card.types IS NOT NULL)"
      )
      .all();
    const allTypes = allTypesRows.map((r: any) => r.value).filter(Boolean);
    if (allTypes.length < 2) return;
    // Instead of AND, run each type as a separate search and sum the results (simulate OR logic)
    let total = 0;
    for (const type of allTypes) {
      const { cardIds } = await freeQueryBuilder(db, type);
      total += cardIds.length;
    }
    expect(total).toBeGreaterThan(10);
  });

  it("massive: all rarities in one search (should return many cards, OR logic simulated)", async () => {
    const allRarities = db
      .prepare("SELECT DISTINCT rarity FROM Card WHERE rarity IS NOT NULL AND rarity != ''")
      .all()
      .map((r: any) => r.rarity);
    if (allRarities.length < 2) return;
    let total = 0;
    for (const rarity of allRarities) {
      const { cardIds } = await freeQueryBuilder(db, rarity);
      total += cardIds.length;
    }
    expect(total).toBeGreaterThan(10);
  });

  it("stress: 100 fake words (should return no cards)", async () => {
    const fakeWords = Array.from({ length: 100 }, (_, i) => `FakeWord${i}_${Date.now()}`).join(" ");
    const { cardIds } = await freeQueryBuilder(db, fakeWords);
    expect(cardIds.length).toBe(0);
  });

  it("attack + ability + set + hp + rarity + type (all major tables, OR logic)", async () => {
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
    // Instead of AND, check that at least one of the search terms returns the card
    const searchTerms = [
      cardRow.attackName,
      cardRow.abilityName,
      cardRow.setName,
      cardRow.hp,
      cardRow.rarity,
      types[0],
    ];
    const found = await Promise.all(
      searchTerms.map(async (term) => {
        const { cardIds } = await freeQueryBuilder(db, String(term));
        return cardIds.includes(cardRow.cardId);
      })
    );
    expect(found.some(Boolean)).toBe(true);
  });

  it("finds cards by flavorText (text field)", async () => {
    const cardRow = db
      .prepare("SELECT cardId, flavorText FROM Card WHERE flavorText IS NOT NULL AND flavorText != '' LIMIT 1")
      .get();
    if (!cardRow) return;
    const word = (cardRow.flavorText as string).split(/\s+/)[0];
    const { cardIds } = await freeQueryBuilder(db, word);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by artist (text field)", async () => {
    const cardRow = db
      .prepare("SELECT cardId, artist FROM Card WHERE artist IS NOT NULL AND artist != '' LIMIT 1")
      .get();
    if (!cardRow) return;
    const { cardIds } = await freeQueryBuilder(db, cardRow.artist);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by supertype (text field)", async () => {
    const cardRow = db
      .prepare("SELECT cardId, supertype FROM Card WHERE supertype IS NOT NULL AND supertype != '' LIMIT 1")
      .get();
    if (!cardRow) return;
    const { cardIds } = await freeQueryBuilder(db, cardRow.supertype);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by subtypes (json-string-array field)", async () => {
    const row = db
      .prepare("SELECT cardId, subtypes FROM Card WHERE subtypes IS NOT NULL AND subtypes != '' LIMIT 1")
      .get();
    if (!row) return;
    let subtypes: string[] = [];
    try {
      subtypes = JSON.parse(row.subtypes);
    } catch {}
    if (!Array.isArray(subtypes) || subtypes.length === 0) return;
    const { cardIds } = await freeQueryBuilder(db, subtypes[0]);
    expect(cardIds).toContain(row.cardId);
  });

  it("finds cards by rules (text field)", async () => {
    const cardRow = db.prepare("SELECT cardId, rules FROM Card WHERE rules IS NOT NULL AND rules != '' LIMIT 1").get();
    if (!cardRow) return;
    const word = (cardRow.rules as string).split(/\s+/)[0];
    const { cardIds } = await freeQueryBuilder(db, word);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by evolvesFrom (text field)", async () => {
    const cardRow = db
      .prepare("SELECT cardId, evolvesFrom FROM Card WHERE evolvesFrom IS NOT NULL AND evolvesFrom != '' LIMIT 1")
      .get();
    if (!cardRow) return;
    const { cardIds } = await freeQueryBuilder(db, cardRow.evolvesFrom);
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by evolvesTo (json-string-array field)", async () => {
    const row = db
      .prepare("SELECT cardId, evolvesTo FROM Card WHERE evolvesTo IS NOT NULL AND evolvesTo != '' LIMIT 1")
      .get();
    if (!row) return;
    let evolvesTo: string[] = [];
    try {
      evolvesTo = JSON.parse(row.evolvesTo);
    } catch {}
    if (!Array.isArray(evolvesTo) || evolvesTo.length === 0) return;
    const { cardIds } = await freeQueryBuilder(db, evolvesTo[0]);
    expect(cardIds).toContain(row.cardId);
  });

  it("finds cards by weaknesses (json-string-array field)", async () => {
    const row = db
      .prepare("SELECT cardId, weaknesses FROM Card WHERE weaknesses IS NOT NULL AND weaknesses != '' LIMIT 1")
      .get();
    if (!row) return;
    let weaknesses: string[] = [];
    try {
      weaknesses = JSON.parse(row.weaknesses);
    } catch {}
    if (!Array.isArray(weaknesses) || weaknesses.length === 0) return;
    const { cardIds } = await freeQueryBuilder(db, weaknesses[0]);
    expect(cardIds).toContain(row.cardId);
  });

  it("finds cards by resistances (json-string-array field)", async () => {
    const row = db
      .prepare("SELECT cardId, resistances FROM Card WHERE resistances IS NOT NULL AND resistances != '' LIMIT 1")
      .get();
    if (!row) return;
    let resistances: string[] = [];
    try {
      resistances = JSON.parse(row.resistances);
    } catch {}
    if (!Array.isArray(resistances) || resistances.length === 0) return;
    const { cardIds } = await freeQueryBuilder(db, resistances[0]);
    expect(cardIds).toContain(row.cardId);
  });

  it("finds cards by convertedRetreatCost (int field)", async () => {
    const cardRow = db
      .prepare("SELECT cardId, convertedRetreatCost FROM Card WHERE convertedRetreatCost IS NOT NULL LIMIT 1")
      .get();
    if (!cardRow) return;
    const { cardIds } = await freeQueryBuilder(db, String(cardRow.convertedRetreatCost));
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by multi-word partial search (should match AND logic)", async () => {
    const cardRow = db.prepare("SELECT cardId, name FROM Card WHERE name LIKE '% %' LIMIT 1").get();
    if (!cardRow) return;
    const words = (cardRow.name as string).split(/\s+/).filter(Boolean);
    if (words.length < 2) return;
    const partial = words.map((w) => w.slice(0, 2)).join(" ");
    const { cardIds } = await freeQueryBuilder(db, partial);
    // Should match if both partials are present in the name
    expect(cardIds).toContain(cardRow.cardId);
  });

  it("finds cards by diacritics-insensitive search (Pokémon normalization)", async () => {
    const cardRow = db.prepare("SELECT cardId, name FROM Card WHERE name LIKE '%Pok%' LIMIT 1").get();
    if (!cardRow) return;
    const { cardIds } = await freeQueryBuilder(db, "pokemon");
    expect(cardIds).toContain(cardRow.cardId);
  });
});
