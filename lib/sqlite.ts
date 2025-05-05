import { type SQLiteDatabase } from "expo-sqlite";

// Import the JSON data files
const cardSetData = require("@/assets/database/CardSet.json");
const abilitiesData = require("@/assets/database/Abilities.json");
const attacksData = require("@/assets/database/Attacks.json");
const cardData = require("@/assets/database/Card.json");
const cardAbilitiesData = require("@/assets/database/CardAbilities.json");
const cardAttacksData = require("@/assets/database/CardAttacks.json");

// --- Helper function to populate data ---
async function populateDataFromJSON(db: SQLiteDatabase, setIsUpdating: (isUpdating: boolean) => void) {
  console.log("Populating data from JSON...");
  setIsUpdating(true); // Indicate update start
  try {
    // Wrap population in a transaction for efficiency and safety
    await db.withTransactionAsync(async () => {
      // Clear existing data (important for updates!)
      console.log("Clearing existing data...");
      await db.execAsync("DELETE FROM CardAttacks;");
      await db.execAsync("DELETE FROM CardAbilities;");
      await db.execAsync("DELETE FROM Card;");
      await db.execAsync("DELETE FROM Attacks;");
      await db.execAsync("DELETE FROM Abilities;");
      await db.execAsync("DELETE FROM CardSet;");
      // Reset autoincrement counters if needed (optional but good practice)
      await db.execAsync(
        "DELETE FROM sqlite_sequence WHERE name IN ('CardSet', 'Abilities', 'Attacks', 'Card', 'CardAbilities', 'CardAttacks');"
      );
      console.log("Existing data cleared.");

      // Populate CardSet
      console.log(`Populating CardSet (${cardSetData.length} items)...`);
      const insertSetStmt = await db.prepareAsync(
        "INSERT INTO CardSet (id, setId, name, series, printedTotal, total, releaseDate, updatedAt, ptcgoCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      for (const item of cardSetData) {
        await insertSetStmt.executeAsync([
          item.id,
          item.setId,
          item.name,
          item.series,
          item.printedTotal,
          item.total,
          item.releaseDate,
          item.updatedAt,
          item.ptcgoCode,
        ]);
      }
      await insertSetStmt.finalizeAsync();
      console.log("CardSet populated.");

      // Populate Abilities
      console.log(`Populating Abilities (${abilitiesData.length} items)...`);
      const insertAbilityStmt = await db.prepareAsync("INSERT INTO Abilities (id, name, text) VALUES (?, ?, ?)");
      for (const item of abilitiesData) {
        await insertAbilityStmt.executeAsync([item.id, item.name, item.text]);
      }
      await insertAbilityStmt.finalizeAsync();
      console.log("Abilities populated.");

      // Populate Attacks
      console.log(`Populating Attacks (${attacksData.length} items)...`);
      const insertAttackStmt = await db.prepareAsync("INSERT INTO Attacks (id, name, text) VALUES (?, ?, ?)");
      for (const item of attacksData) {
        await insertAttackStmt.executeAsync([item.id, item.name, item.text]);
      }
      await insertAttackStmt.finalizeAsync();
      console.log("Attacks populated.");

      // Populate Card
      console.log(`Populating Card (${cardData.length} items)...`);
      const insertCardStmt = await db.prepareAsync(
        "INSERT INTO Card (id, cardId, name, supertype, subtypes, hp, types, evolvesFrom, weaknesses, resistances, evolvesTo, retreatCost, convertedRetreatCost, flavorText, artist, rarity, nationalPokedexNumbers, regulationMark, imagesLarge, rules, number, setId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      for (const item of cardData) {
        await insertCardStmt.executeAsync([
          item.id,
          item.cardId,
          item.name,
          item.supertype,
          item.subtypes,
          item.hp,
          item.types,
          item.evolvesFrom,
          item.weaknesses,
          item.resistances,
          item.evolvesTo,
          item.retreatCost,
          item.convertedRetreatCost,
          item.flavorText,
          item.artist,
          item.rarity,
          item.nationalPokedexNumbers,
          item.regulationMark,
          item.imagesLarge,
          item.rules,
          item.number,
          item.setId,
        ]);
      }
      await insertCardStmt.finalizeAsync();
      console.log("Card populated.");

      // Populate CardAbilities
      console.log(`Populating CardAbilities (${cardAbilitiesData.length} items)...`);
      const insertCardAbilityStmt = await db.prepareAsync(
        "INSERT INTO CardAbilities (id, cardId, abilityId) VALUES (?, ?, ?)"
      );
      for (const item of cardAbilitiesData) {
        await insertCardAbilityStmt.executeAsync([item.id, item.cardId, item.abilityId]);
      }
      await insertCardAbilityStmt.finalizeAsync();
      console.log("CardAbilities populated.");

      // Populate CardAttacks
      console.log(`Populating CardAttacks (${cardAttacksData.length} items)...`);
      const insertCardAttackStmt = await db.prepareAsync(
        "INSERT INTO CardAttacks (id, cardId, attackId, cost, convertedEnergyCost, damage) VALUES (?, ?, ?, ?, ?, ?)"
      );
      for (const item of cardAttacksData) {
        await insertCardAttackStmt.executeAsync([
          item.id,
          item.cardId,
          item.attackId,
          item.cost,
          item.convertedEnergyCost,
          item.damage,
        ]);
      }
      await insertCardAttackStmt.finalizeAsync();
      console.log("CardAttacks populated.");
    });
    console.log("Data population transaction complete.");
  } finally {
    setIsUpdating(false); // Indicate update end, even if error occurs
  }
}

export async function migrateDbIfNeeded(db: SQLiteDatabase, setIsUpdating: (isUpdating: boolean) => void) {
  // ----> INCREMENT THIS WHEN JSON CHANGES <----
  const DATABASE_VERSION = 7;

  // Don't set updating to true initially
  // setIsUpdating(true);

  const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let currentDbVersion = result?.user_version ?? 0;

  console.log(`Current DB version: ${currentDbVersion}, Required DB version: ${DATABASE_VERSION}`);

  if (currentDbVersion >= DATABASE_VERSION) {
    console.log("Database is up-to-date.");
    // Ensure state is false if we return early
    setIsUpdating(false);
    return;
  }

  // Set updating to true ONLY if migration is needed
  console.log(`Starting migration from version ${currentDbVersion} to ${DATABASE_VERSION}...`);
  setIsUpdating(true);

  try {
    // --- Migration Steps ---

    // Step 1: Initial Schema Creation (Only if db is brand new)
    if (currentDbVersion < 1) {
      console.log("Applying version 1 migration: Initial schema creation...");

      // Set WAL mode *before* the transaction
      await db.execAsync("PRAGMA journal_mode = 'wal';");

      await db.withTransactionAsync(async () => {
        console.log("Creating initial schema...");

        await db.execAsync(`
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
        `);
        console.log("Schema created.");
      });
      console.log("Version 1 migration complete.");
    }

    // Step 2: Data Refresh (if first time or if version is outdated)
    if (currentDbVersion < DATABASE_VERSION) {
      console.log(`Refreshing data to match version ${DATABASE_VERSION}...`);
      // Pass the callback down
      await populateDataFromJSON(db, setIsUpdating);
      console.log(`Data refreshed for version ${DATABASE_VERSION}.`);
    }

    // --- Set Final Version ---
    if (currentDbVersion < DATABASE_VERSION) {
      console.log(`Setting final database version to ${DATABASE_VERSION}...`);
      await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    }
  } finally {
    // Ensure setIsUpdating(false) is called even if populateDataFromJSON was skipped
    // or if an error occurred during migration steps but before populateDataFromJSON.
    // populateDataFromJSON has its own finally block, but this covers other scenarios.
    setIsUpdating(false);
  }

  console.log("Database migration check finished.");
}
