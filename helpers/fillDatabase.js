import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "../db/pokemonCardsDB.sqlite");
const db = new Database(dbPath);

// Create tables
const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS CardSet (
      id TEXT PRIMARY KEY,
      name TEXT,
      series TEXT,
      printedTotal INTEGER,
      total INTEGER,
      releaseDate TEXT,
      updatedAt TEXT,
      symbol TEXT,
      logo TEXT,
      ptcgoCode TEXT
    );

    CREATE TABLE IF NOT EXISTS Abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      type TEXT,
      text TEXT
    );

    CREATE TABLE IF NOT EXISTS Attacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      damage TEXT,
      text TEXT
    );

    CREATE TABLE IF NOT EXISTS Card (
      id TEXT PRIMARY KEY,
      name TEXT,
      supertype TEXT,
      subtypes TEXT,
      hp INTEGER,
      types TEXT,
      evolvesFrom TEXT,
      weaknesses TEXT,
      resistances TEXT,
      evolvesTo TEXT,
      retreatCost TEXT,
      convertedRetreatCost INTEGER,
      flavorText TEXT,
      artist TEXT,
      rarity TEXT,
      nationalPokedexNumbers TEXT,
      regulationMark TEXT,
      imagesSmall TEXT,
      imagesLarge TEXT,
      rules TEXT,
      number TEXT,
      cardSetId TEXT,
      FOREIGN KEY (cardSetId) REFERENCES CardSet (id)
    );

    CREATE TABLE IF NOT EXISTS CardAbilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId TEXT,
      abilityId INTEGER,
      FOREIGN KEY (cardId) REFERENCES Card (id),
      FOREIGN KEY (abilityId) REFERENCES Abilities (id)
    );

    CREATE TABLE IF NOT EXISTS CardAttacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId TEXT,
      attackId INTEGER,
      cost TEXT,
      convertedEnergyCost INTEGER,
      FOREIGN KEY (cardId) REFERENCES Card (id),
      FOREIGN KEY (attackId) REFERENCES Attacks (id)
    );
  `);
};

const insertOrGetId = (tableName, uniqueColumn, data) => {
  const columns = Object.keys(data).join(", ");
  const placeholders = Object.keys(data)
    .map(() => "?")
    .join(", ");

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO ${tableName} (${columns})
    VALUES (${placeholders})
  `);
  stmt.run(...Object.values(data));

  const row = db.prepare(`SELECT id FROM ${tableName} WHERE ${uniqueColumn} = ?`).get(data[uniqueColumn]);
  return row.id;
};

const insertCardSet = (set) => {
  return insertOrGetId("CardSet", "id", {
    id: set.id,
    name: set.name,
    series: set.series,
    printedTotal: set.printedTotal,
    total: set.total,
    releaseDate: set.releaseDate,
    updatedAt: set.updatedAt,
    symbol: set.images?.symbol,
    logo: set.images?.logo,
    ptcgoCode: set.ptcgoCode,
  });
};

const insertAbility = (ability) => {
  return insertOrGetId("Abilities", "name", {
    name: ability.name,
    type: ability.type,
    text: ability.text,
  });
};

const insertAttack = (attack) => {
  return insertOrGetId("Attacks", "name", {
    name: attack.name,
    damage: attack.damage,
    text: attack.text,
  });
};

// Insert Card
const insertCard = (card) => {
  const weaknesses = card.weaknesses ? JSON.stringify(card.weaknesses) : null;
  const resistances = card.resistances ? JSON.stringify(card.resistances) : null;
  const evolvesTo = card.evolvesTo ? JSON.stringify(card.evolvesTo) : null;
  const rules = card.rules ? JSON.stringify(card.rules) : null;

  // Ensure CardSet is inserted and retrieve its ID
  let cardSetId = null;
  if (card.set && card.set.id) {
    const existingSet = db.prepare("SELECT id FROM CardSet WHERE id = ?").get(card.set.id);
    if (existingSet) {
      cardSetId = existingSet.id;
    } else {
      cardSetId = insertCardSet(card.set);
    }
  }

  if (!cardSetId) {
    console.error(`CardSet ID missing for card ${card.id}. Skipping card.`);
    return;
  }

  try {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO Card (
        id, name, supertype, subtypes, hp, types, evolvesFrom, weaknesses, resistances, evolvesTo, retreatCost,
        convertedRetreatCost, flavorText, artist, rarity, nationalPokedexNumbers,
        regulationMark, imagesSmall, imagesLarge, rules, number, cardSetId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      card.id,
      card.name,
      card.supertype,
      JSON.stringify(card.subtypes),
      card.hp,
      JSON.stringify(card.types),
      card.evolvesFrom,
      weaknesses,
      resistances,
      evolvesTo,
      JSON.stringify(card.retreatCost),
      card.convertedRetreatCost,
      card.flavorText,
      card.artist,
      card.rarity,
      JSON.stringify(card.nationalPokedexNumbers),
      card.regulationMark,
      card.images?.small,
      card.images?.large,
      rules,
      card.number,
      cardSetId
    );

    // Insert abilities into CardAbilities table
    if (card.abilities) {
      card.abilities.forEach((ability) => {
        const abilityId = insertAbility(ability);
        db.prepare(`INSERT OR IGNORE INTO CardAbilities (cardId, abilityId) VALUES (?, ?)`).run(card.id, abilityId);
      });
    }

    // Insert attacks into CardAttacks table
    if (card.attacks) {
      card.attacks.forEach((attack) => {
        const attackId = insertAttack(attack);
        db.prepare(
          `INSERT OR IGNORE INTO CardAttacks (cardId, attackId, cost, convertedEnergyCost) VALUES (?, ?, ?, ?)`
        ).run(card.id, attackId, JSON.stringify(attack.cost), attack.convertedEnergyCost);
      });
    }
  } catch (error) {
    console.error(`Failed to insert card ${card.id}:`, error.message);
  }
};

// Main function
const fillDatabase = () => {
  createTables();

  const dataPath = path.resolve(__dirname, "../db/metaCards.json");
  const cards = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  cards.forEach((card) => {
    insertCard(card);
  });

  console.log("Database seeding complete.");
};

fillDatabase();
