const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.resolve(__dirname, "../scripts/db/pokemonCardsDB.db");
const db = new Database(dbPath);

// Create tables
const createTables = () => {
  const schemaSQL = `
    CREATE TABLE IF NOT EXISTS CardSet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setId TEXT UNIQUE,
      name TEXT,
      series TEXT,
      printedTotal INTEGER,
      total INTEGER,
      releaseDate TEXT,
      updatedAt TEXT,
      ptcgoCode TEXT
    );

    CREATE TABLE IF NOT EXISTS Abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      text TEXT
    );

    CREATE TABLE IF NOT EXISTS Attacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      text TEXT
    );

    CREATE TABLE IF NOT EXISTS Card (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId TEXT UNIQUE,
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
      imagesLarge TEXT,
      rules TEXT,
      number TEXT,
      setId INTEGER,
      FOREIGN KEY (setId) REFERENCES CardSet (id)
    );

    CREATE TABLE IF NOT EXISTS CardAbilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId INTEGER,
      abilityId INTEGER,
      FOREIGN KEY (cardId) REFERENCES Card (id),
      FOREIGN KEY (abilityId) REFERENCES Abilities (id)
    );

    CREATE TABLE IF NOT EXISTS CardAttacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId INTEGER,
      attackId INTEGER,
      cost TEXT,
      convertedEnergyCost INTEGER,
      damage TEXT,
      FOREIGN KEY (cardId) REFERENCES Card (id),
      FOREIGN KEY (attackId) REFERENCES Attacks (id)
    );
  `;

  // Write schema to db/cardsSchema.sql
  const schemaPath = path.resolve(__dirname, "../scripts/db/cardsSchema.sql");
  fs.writeFileSync(schemaPath, schemaSQL.trim() + "\n");

  db.exec(schemaSQL);
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
  return insertOrGetId("CardSet", "setId", {
    setId: set.id,
    name: set.name,
    series: set.series,
    printedTotal: set.printedTotal,
    total: set.total,
    releaseDate: set.releaseDate,
    updatedAt: set.updatedAt,
    ptcgoCode: set.ptcgoCode,
  });
};

const insertAbility = (ability) => {
  return insertOrGetId("Abilities", "name", {
    name: ability.name,
    text: ability.text,
  });
};

const insertAttack = (attack) => {
  return insertOrGetId("Attacks", "name", {
    name: attack.name,
    text: attack.text,
  });
};

// Insert Card
const insertCard = (card) => {
  const weaknesses = card.weaknesses ? JSON.stringify(card.weaknesses.map((w) => w.type)) : null;
  const resistances = card.resistances ? JSON.stringify(card.resistances.map((w) => w.type)) : null;
  const evolvesTo = card.evolvesTo ? JSON.stringify(card.evolvesTo) : null;
  const rules = card.rules ? JSON.stringify(card.rules) : null;

  // Ensure CardSet is inserted and retrieve its ID
  let cardSetId = null;
  if (card.set && card.set.id) {
    const existingSet = db.prepare("SELECT id FROM CardSet WHERE setId = ?").get(card.set.id);
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
        cardId, name, supertype, subtypes, hp, types, evolvesFrom, weaknesses, resistances, evolvesTo, retreatCost,
        convertedRetreatCost, flavorText, artist, rarity, nationalPokedexNumbers,
        regulationMark, imagesLarge, rules, number, setId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      card.images?.large,
      rules,
      card.number,
      cardSetId
    );

    // Get the integer id for the inserted card
    const cardRow = db.prepare("SELECT id FROM Card WHERE cardId = ?").get(card.id);
    if (!cardRow) return;
    const cardIntId = cardRow.id;

    // Insert abilities into CardAbilities table
    if (card.abilities) {
      card.abilities.forEach((ability) => {
        const abilityId = insertAbility(ability);
        db.prepare(`INSERT OR IGNORE INTO CardAbilities (cardId, abilityId) VALUES (?, ?)`).run(cardIntId, abilityId);
      });
    }

    // Insert attacks into CardAttacks table
    if (card.attacks) {
      card.attacks.forEach((attack) => {
        const attackId = insertAttack(attack);
        db.prepare(
          `INSERT OR IGNORE INTO CardAttacks (cardId, attackId, cost, convertedEnergyCost, damage) VALUES (?, ?, ?, ?, ?)`
        ).run(cardIntId, attackId, JSON.stringify(attack.cost), attack.convertedEnergyCost, attack.damage);
      });
    }
  } catch (error) {
    console.error(`Failed to insert card ${card.id}:`, error.message);
  }
};

// Main function
const fillDatabase = () => {
  createTables();

  const dataPath = path.resolve(__dirname, "../scripts/db/rotationCards.json");
  const cards = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  cards.forEach((card) => {
    insertCard(card);
  });

  console.log("Database seeding complete.");

  fixNullConvertedRetreatCost();
  updateCardSetCodes();
};

// Function to set convertedRetreatCost to 0 for Pokémon cards where it is null
function fixNullConvertedRetreatCost() {
  const db = new Database(dbPath);
  const result = db
    .prepare("UPDATE Card SET convertedRetreatCost = 0 WHERE supertype = 'Pokémon' AND convertedRetreatCost IS NULL")
    .run();
  db.close();
  console.log(`Set convertedRetreatCost = 0 for ${result.changes} Pokémon cards where it was null.`);
}

// Function to update CardSet table with ptcgoCode
function updateCardSetCodes() {
  const nameToCode = [
    { name: "Journey Together", ptcgoCode: "JTG" },
    { name: "Prismatic Evolutions", ptcgoCode: "PRE" },
    { name: "Surging Sparks", ptcgoCode: "SSP" },
    { name: "Stellar Crown", ptcgoCode: "SCR" },
    { name: "Shrouded Fable", ptcgoCode: "SFA" },
    { name: "Twilight Masquerade", ptcgoCode: "TWM" },
    { name: "Temporal Forces", ptcgoCode: "TEF" },
    { name: "Paldean Fates", ptcgoCode: "PAF" },
    { name: "Paradox Rift", ptcgoCode: "PAR" },
    { name: "151", ptcgoCode: "MEW" },
    { name: "McDonald’s Match Battle 2023", ptcgoCode: "M23" },
    { name: "Obsidian Flames", ptcgoCode: "OBF" },
    { name: "Paldea Evolved", ptcgoCode: "PAL" },
    { name: "Scarlet & Violet Energies", ptcgoCode: "SVE" },
    { name: "Scarlet & Violet", ptcgoCode: "SVI" },
    { name: "Scarlet & Violet Promos", ptcgoCode: "SVP" },
  ];

  const db = new Database(dbPath);
  let updated = 0;
  for (const entry of nameToCode) {
    const result = db.prepare("UPDATE CardSet SET ptcgoCode = ? WHERE name = ?").run(entry.ptcgoCode, entry.name);
    if (result.changes > 0) updated++;
  }
  db.close();
  console.log(`Updated ${updated} CardSet rows with ptcgoCode.`);
}

fillDatabase();
