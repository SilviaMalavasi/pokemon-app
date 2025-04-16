const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Initialize the database
const dbPath = path.resolve(__dirname, "../db/pokemonCardsDB.sqlite");
const db = new Database(dbPath);

// Drop the cards table if it exists
db.exec("DROP TABLE IF EXISTS cards;");

// Create the cards table
const createTableQuery = `
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  name TEXT,
  supertype TEXT,
  subtypes TEXT,
  hp TEXT,
  types TEXT,
  evolvesFrom TEXT,
  flavorText TEXT,
  rarity TEXT,
  image TEXT,
  attacks TEXT,
  weaknesses TEXT,
  retreatCost TEXT,
  convertedRetreatCost INTEGER,
  cardSet TEXT,
  number TEXT,
  artist TEXT,
  nationalPokedexNumbers TEXT,
  legalities TEXT,
  regulationMark TEXT
);
`;
db.exec(createTableQuery);

const createAttacksTableQuery = `
CREATE TABLE IF NOT EXISTS attacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT,
  name TEXT,
  cost TEXT,
  convertedEnergyCost INTEGER,
  damage TEXT,
  text TEXT,
  FOREIGN KEY (card_id) REFERENCES cards (id)
);
`;

const createAbilitiesTableQuery = `
CREATE TABLE IF NOT EXISTS abilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT,
  name TEXT,
  text TEXT,
  type TEXT,
  FOREIGN KEY (card_id) REFERENCES cards (id)
);
`;

const createWeaknessesTableQuery = `
CREATE TABLE IF NOT EXISTS weaknesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT,
  type TEXT,
  value TEXT,
  FOREIGN KEY (card_id) REFERENCES cards (id)
);
`;

const createCardSetTableQuery = `
CREATE TABLE IF NOT EXISTS cardSet (
  id TEXT PRIMARY KEY,
  name TEXT,
  series TEXT,
  printedTotal INTEGER,
  total INTEGER,
  ptcgoCode TEXT,
  releaseDate TEXT,
  updatedAt TEXT,
  symbol TEXT,
  logo TEXT
);
`;

const createLegalitiesTableQuery = `
CREATE TABLE IF NOT EXISTS legalities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT,
  unlimited TEXT,
  standard TEXT,
  expanded TEXT,
  FOREIGN KEY (card_id) REFERENCES cards (id)
);
`;

const createImagesTableQuery = `
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT,
  small TEXT,
  large TEXT,
  FOREIGN KEY (card_id) REFERENCES cards (id)
);
`;

db.exec(createAttacksTableQuery);
db.exec(createAbilitiesTableQuery);
db.exec(createWeaknessesTableQuery);
db.exec(createCardSetTableQuery);
db.exec(createLegalitiesTableQuery);
db.exec(createImagesTableQuery);

// Seed the database with data from filteredCards.json
const cardsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../db/filteredCards.json"), "utf-8"));
const insertCardQuery = db.prepare(`
INSERT OR REPLACE INTO cards (
  id, name, supertype, subtypes, hp, types, evolvesFrom, flavorText, rarity, image, attacks, weaknesses, retreatCost, convertedRetreatCost, cardSet, number, artist, nationalPokedexNumbers, legalities, regulationMark
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

const insertAttackQuery = db.prepare(`
INSERT INTO attacks (card_id, name, cost, convertedEnergyCost, damage, text)
VALUES (?, ?, ?, ?, ?, ?);
`);

const insertAbilityQuery = db.prepare(`
INSERT INTO abilities (card_id, name, text, type)
VALUES (?, ?, ?, ?);
`);

const insertWeaknessQuery = db.prepare(`
INSERT INTO weaknesses (card_id, type, value)
VALUES (?, ?, ?);
`);

const insertCardSetQuery = db.prepare(`
INSERT OR REPLACE INTO cardSet (
  id, name, series, printedTotal, total, ptcgoCode, releaseDate, updatedAt, symbol, logo
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

const insertLegalitiesQuery = db.prepare(`
INSERT INTO legalities (card_id, unlimited, standard, expanded)
VALUES (?, ?, ?, ?);
`);

const insertImagesQuery = db.prepare(`
INSERT INTO images (card_id, small, large)
VALUES (?, ?, ?);
`);

const insertMany = db.transaction((cards) => {
  for (const card of cards) {
    insertCardQuery.run(
      card.id,
      card.name,
      card.supertype,
      JSON.stringify(card.subtypes),
      card.hp,
      JSON.stringify(card.types),
      card.evolvesFrom || null,
      card.flavorText || null,
      card.rarity || null,
      card.images?.large || null,
      JSON.stringify(card.attacks) || null,
      JSON.stringify(card.weaknesses) || null,
      JSON.stringify(card.retreatCost) || null,
      card.convertedRetreatCost || null,
      JSON.stringify(card.cardSet) || null,
      card.number || null,
      card.artist || null,
      JSON.stringify(card.nationalPokedexNumbers) || null,
      JSON.stringify(card.legalities) || null,
      card.regulationMark || null
    );
  }
});

const insertManyNested = db.transaction((cards) => {
  for (const card of cards) {
    if (card.attacks) {
      for (const attack of card.attacks) {
        insertAttackQuery.run(
          card.id,
          attack.name,
          JSON.stringify(attack.cost),
          attack.convertedEnergyCost,
          attack.damage,
          attack.text
        );
      }
    }

    if (card.abilities) {
      for (const ability of card.abilities) {
        insertAbilityQuery.run(card.id, ability.name, ability.text, ability.type);
      }
    }

    if (card.weaknesses) {
      for (const weakness of card.weaknesses) {
        insertWeaknessQuery.run(card.id, weakness.type, weakness.value);
      }
    }
  }
});

const insertManyAdditional = db.transaction((cards) => {
  for (const card of cards) {
    if (card.legalities) {
      insertLegalitiesQuery.run(
        card.id,
        card.legalities.unlimited || null,
        card.legalities.standard || null,
        card.legalities.expanded || null
      );
    }

    if (card.images) {
      insertImagesQuery.run(card.id, card.images.small || null, card.images.large || null);
    }
  }
});

const insertManyCardSet = db.transaction((cards) => {
  for (const card of cards) {
    if (card.cardSet) {
      insertCardSetQuery.run(
        card.cardSet.id || null,
        card.cardSet.name || null,
        card.cardSet.series || null,
        card.cardSet.printedTotal || null,
        card.cardSet.total || null,
        card.cardSet.ptcgoCode || null,
        card.cardSet.releaseDate || null,
        card.cardSet.updatedAt || null,
        card.cardSet.images?.symbol || null,
        card.cardSet.images?.logo || null
      );
    }
  }
});

insertMany(cardsData);
insertManyNested(cardsData);
insertManyAdditional(cardsData);
insertManyCardSet(cardsData);

console.log("Database seeded successfully.");
