import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";

// ----> INCREMENT THIS WHEN JSON CHANGES <----
const DATABASE_VERSION = 39;

// Data types for JSON imports
interface CardSet {
  id: number;
  setId: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  updatedAt: string;
  ptcgoCode: string;
}
interface Ability {
  id: number;
  name: string;
  text: string;
}
interface Attack {
  id: number;
  name: string;
  text: string;
}
interface Card {
  id: number;
  cardId: string;
  name: string;
  supertype: string;
  subtypes: string;
  hp: number;
  types: string;
  evolvesFrom: string;
  weaknesses: string;
  resistances: string;
  evolvesTo: string;
  retreatCost: string;
  convertedRetreatCost: number;
  flavorText: string;
  artist: string;
  rarity: string;
  nationalPokedexNumbers: string;
  regulationMark: string;
  imagesLarge: string;
  rules: string;
  number: string;
  setId: number;
}
interface CardAbility {
  id: number;
  cardId: number;
  abilityId: number;
}
interface CardAttack {
  id: number;
  cardId: number;
  attackId: number;
  cost: string;
  convertedEnergyCost: number;
  damage: string;
}

// Import the JSON data files
const cardSetData: CardSet[] = require("@/assets/database/CardSet.json");
const abilitiesData: Ability[] = require("@/assets/database/Abilities.json");
const attacksData: Attack[] = require("@/assets/database/Attacks.json");
const cardData: Card[] = require("@/assets/database/Card.json");
const cardAbilitiesData: CardAbility[] = require("@/assets/database/CardAbilities.json");
const cardAttacksData: CardAttack[] = require("@/assets/database/CardAttacks.json");

// Batch size for large operations
const BATCH_SIZE = 1000;

// --- Helper function to process data in batches with better error handling ---
async function processBatch<T>(
  db: SQLiteDatabase,
  items: T[],
  processFn: (batch: T[]) => Promise<void>,
  batchSize: number = BATCH_SIZE,
  itemName: string = "items"
) {
  console.log(`Processing ${items.length} ${itemName} in batches of ${batchSize}...`);

  // Process items in chunks to avoid memory issues
  for (let i = 0; i < items.length; i += batchSize) {
    try {
      const batch = items.slice(i, i + batchSize);
      // WRAP THE BATCH IN A TRANSACTION
      await db.withTransactionAsync(async () => {
        await processFn(batch);
      });
      // Log progress for large datasets (but not too frequently)
      const batchEnd = Math.min(i + batchSize, items.length);
      if (items.length > 500 && (i + batchSize) % 500 === 0) {
        console.log(
          `  Progress: ${batchEnd}/${items.length} ${itemName} (${Math.round((batchEnd / items.length) * 100)}%)`
        );
      }
    } catch (error) {
      console.error(`Error processing batch ${i}/${items.length} of ${itemName}:`, error);
      throw error;
    }
  }
  console.log(`Finished processing all ${items.length} ${itemName}`);
}

// --- Helper function to safely execute an SQL statement with detailed error handling ---
async function safeExecuteAsync(stmt: SQLiteStatement, params: any[], itemType: string, itemId: any): Promise<void> {
  try {
    await stmt.executeAsync(params);
  } catch (error) {
    console.error(`Error executing statement for ${itemType} with ID ${itemId}:`, error);
    // Don't throw, allow the process to continue with other items
  }
}

// --- Helper function to populate data ---
async function populateDataFromJSON(
  db: SQLiteDatabase,
  setIsUpdating: (isUpdating: boolean) => void,
  setProgress?: (progress: number) => void
) {
  console.log("Starting database population from JSON...");
  setIsUpdating(true); // Indicate update start
  try {
    // Clear existing data (important for updates!)
    console.log("Clearing existing data...");
    await db.execAsync("DELETE FROM CardAttacks;");
    await db.execAsync("DELETE FROM CardAbilities;");
    await db.execAsync("DELETE FROM Card;");
    await db.execAsync("DELETE FROM Attacks;");
    await db.execAsync("DELETE FROM Abilities;");
    await db.execAsync("DELETE FROM CardSet;");
    // Reset autoincrement counters
    await db.execAsync(
      "DELETE FROM sqlite_sequence WHERE name IN ('CardSet', 'Abilities', 'Attacks', 'Card', 'CardAbilities', 'CardAttacks');"
    );
    console.log("Existing data cleared.");

    // ---- CardSet Population ----
    console.log(`Populating CardSet (${cardSetData.length} items)...`);
    const insertSetStmt = await db.prepareAsync(
      "INSERT INTO CardSet (id, setId, name, series, printedTotal, total, releaseDate, updatedAt, ptcgoCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    try {
      // CardSet is usually small enough to process without batching
      for (const item of cardSetData) {
        await safeExecuteAsync(
          insertSetStmt,
          [
            item.id,
            item.setId,
            item.name,
            item.series,
            item.printedTotal,
            item.total,
            item.releaseDate,
            item.updatedAt,
            item.ptcgoCode,
          ],
          "CardSet",
          item.id
        );
      }
      console.log("CardSet populated successfully.");
    } catch (error) {
      console.error("Error populating CardSet:", error);
    } finally {
      await insertSetStmt.finalizeAsync();
    }

    // ---- Abilities Population ----
    console.log(`Populating Abilities (${abilitiesData.length} items)...`);
    const insertAbilityStmt = await db.prepareAsync(
      "INSERT OR IGNORE INTO Abilities (id, name, text) VALUES (?, ?, ?)"
    );

    try {
      await processBatch(
        db,
        abilitiesData,
        async (batch) => {
          for (const item of batch) {
            await safeExecuteAsync(insertAbilityStmt, [item.id, item.name, item.text], "Ability", item.id);
          }
        },
        BATCH_SIZE,
        "abilities"
      );
      console.log("Abilities populated successfully.");
    } catch (error) {
      console.error("Error populating Abilities:", error);
    } finally {
      await insertAbilityStmt.finalizeAsync();
    }

    // Build set of inserted ability IDs
    const insertedAbilityIds = new Set<number>(abilitiesData.map((a) => a.id));

    // ---- Attacks Population ----
    console.log(`Populating Attacks (${attacksData.length} items)...`);
    const insertAttackStmt = await db.prepareAsync("INSERT OR IGNORE INTO Attacks (id, name, text) VALUES (?, ?, ?)");

    try {
      await processBatch(
        db,
        attacksData,
        async (batch) => {
          for (const item of batch) {
            await safeExecuteAsync(insertAttackStmt, [item.id, item.name, item.text], "Attack", item.id);
          }
        },
        BATCH_SIZE,
        "attacks"
      );
      console.log("Attacks populated successfully.");
    } catch (error) {
      console.error("Error populating Attacks:", error);
    } finally {
      await insertAttackStmt.finalizeAsync();
    }

    // Build set of inserted attack IDs
    const insertedAttackIds = new Set<number>(attacksData.map((a) => a.id));

    // ---- Card Population ----
    // First, check for duplicate IDs in the card data
    console.log(`Analyzing ${cardData.length} cards for duplicates...`);
    const seenIds = new Set<number>();
    const uniqueCardData = cardData.filter((card) => {
      if (seenIds.has(card.id)) {
        console.warn(`Duplicate card ID found: ${card.id}, skipping...`);
        return false;
      }
      seenIds.add(card.id);
      return true;
    });
    console.log(
      `Found ${cardData.length - uniqueCardData.length} duplicate card IDs. Processing ${
        uniqueCardData.length
      } unique cards.`
    );

    const insertCardStmt = await db.prepareAsync(
      "INSERT OR IGNORE INTO Card (id, cardId, name, supertype, subtypes, hp, types, evolvesFrom, weaknesses, " +
        "resistances, evolvesTo, retreatCost, convertedRetreatCost, flavorText, artist, rarity, " +
        "nationalPokedexNumbers, regulationMark, imagesLarge, rules, number, setId) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    // --- Card Population ---
    try {
      await processBatch(
        db,
        uniqueCardData,
        async (batch) => {
          for (const item of batch) {
            await safeExecuteAsync(
              insertCardStmt,
              [
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
              ],
              "Card",
              item.id
            );
          }
        },
        BATCH_SIZE,
        "cards"
      );
      console.log("Card data populated successfully.");
    } catch (error) {
      console.error("Error populating Card table:", error);
    } finally {
      await insertCardStmt.finalizeAsync();
    }

    // After inserting cards, abilities, and attacks
    // Query the DB for actual IDs
    const cardRows = await db.getAllAsync<{ id: number }>("SELECT id FROM Card");
    const abilityRows = await db.getAllAsync<{ id: number }>("SELECT id FROM Abilities");
    const attackRows = await db.getAllAsync<{ id: number }>("SELECT id FROM Attacks");
    const actualCardIds = new Set(cardRows.map((row) => row.id));
    const actualAbilityIds = new Set(abilityRows.map((row) => row.id));
    const actualAttackIds = new Set(attackRows.map((row) => row.id));

    // Prepare filtered ability/attack data for progress tracking
    const filteredCardAbilitiesData = cardAbilitiesData.filter(
      (item) => actualCardIds.has(item.cardId) && actualAbilityIds.has(item.abilityId)
    );
    const filteredCardAttacksData = cardAttacksData.filter(
      (item) => actualCardIds.has(item.cardId) && actualAttackIds.has(item.attackId)
    );
    const totalCards = uniqueCardData.length;
    const totalCardAbilities = filteredCardAbilitiesData.length;
    const totalCardAttacks = filteredCardAttacksData.length;
    const total = totalCards + totalCardAbilities + totalCardAttacks;
    let processed = 0;

    // --- CardAbilities Population ---
    console.log(`Populating CardAbilities (${cardAbilitiesData.length} items)...`);

    // Filter cardAbilitiesData to only include cards that exist in our database
    console.log(
      `Processing ${filteredCardAbilitiesData.length} card abilities (skipped ${
        cardAbilitiesData.length - filteredCardAbilitiesData.length
      } with missing cards)`
    );

    // --- CardAbilities Population (BULK INSERT) ---
    try {
      await processBatch(
        db,
        filteredCardAbilitiesData,
        async (batch) => {
          if (batch.length === 0) return;
          // Build bulk insert statement with inlined values
          const values = batch.map((item) => `(${item.id}, ${item.cardId}, ${item.abilityId})`).join(", ");
          const sql = `INSERT OR IGNORE INTO CardAbilities (id, cardId, abilityId) VALUES ${values}`;
          await db.execAsync(sql);
          processed += batch.length;
          if (setProgress) setProgress(processed / total);
        },
        BATCH_SIZE,
        "card abilities"
      );
      console.log("CardAbilities populated successfully.");
    } catch (error) {
      console.error("Error populating CardAbilities:", error);
    }

    // ---- CardAttacks Population ----
    console.log(`Populating CardAttacks (${cardAttacksData.length} items)...`);

    // Filter cardAttacksData to only include cards that exist in our database
    console.log(
      `Processing ${filteredCardAttacksData.length} card attacks (skipped ${
        cardAttacksData.length - filteredCardAttacksData.length
      } with missing cards)`
    );

    // --- CardAttacks Population (BULK INSERT) ---
    try {
      await processBatch(
        db,
        filteredCardAttacksData,
        async (batch) => {
          if (batch.length === 0) return;
          // Improved escape function to handle null/undefined and strings
          const escape = (val: string | null | undefined) =>
            val == null ? "NULL" : `'${String(val).replace(/'/g, "''")}'`;
          const values = batch
            .map(
              (item) =>
                `(${item.id}, ${item.cardId}, ${item.attackId}, ${escape(item.cost)}, ${
                  item.convertedEnergyCost == null ? "NULL" : item.convertedEnergyCost
                }, ${escape(item.damage)})`
            )
            .join(", ");
          const sql = `INSERT OR IGNORE INTO CardAttacks (id, cardId, attackId, cost, convertedEnergyCost, damage) VALUES ${values}`;
          await db.execAsync(sql);
          processed += batch.length;
          if (setProgress) setProgress(processed / total);
        },
        BATCH_SIZE,
        "card attacks"
      );
      console.log("CardAttacks populated successfully.");
    } catch (error) {
      console.error("Error populating CardAttacks:", error);
    }

    console.log("Data population complete.");
  } catch (error) {
    console.error("Fatal error during data population:", error);
    throw error; // Re-throw to handle in the migration function
  } finally {
    // Always re-enable foreign key checks
    await db.execAsync("PRAGMA foreign_keys = ON;");
    setIsUpdating(false); // Indicate update end, even if error occurs
    if (setProgress) setProgress(1);
  }
}

export async function migrateDbIfNeeded(
  db: SQLiteDatabase,
  setIsUpdating: (isUpdating: boolean) => void,
  setProgress?: (progress: number) => void
) {
  try {
    const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    let currentDbVersion = result?.user_version ?? 0;

    console.log(`Current DB version: ${currentDbVersion}, Required DB version: ${DATABASE_VERSION}`);

    if (currentDbVersion >= DATABASE_VERSION) {
      console.log("Database is up-to-date.");
      // Ensure state is false if we return early
      setIsUpdating(false);
      if (setProgress) setProgress(1);
      return;
    }

    // Set updating to true ONLY if migration is needed
    console.log(`Starting migration from version ${currentDbVersion} to ${DATABASE_VERSION}...`);
    setIsUpdating(true);

    // --- Migration Steps ---

    // Step 1: Initial Schema Creation (Only if db is brand new)
    if (currentDbVersion < 1) {
      try {
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
          console.log("Schema created successfully.");
        });
        console.log("Version 1 migration complete.");

        // Update version after successful schema creation
        currentDbVersion = 1;
        await db.execAsync(`PRAGMA user_version = ${currentDbVersion}`);
        console.log(`Set database version to ${currentDbVersion}`);
      } catch (error) {
        console.error("Schema creation failed:", error);
        throw error;
      }
    }

    // Step 2: Data Refresh (if first time or if version is outdated)
    if (currentDbVersion < DATABASE_VERSION) {
      try {
        console.log(`Refreshing data to match version ${DATABASE_VERSION}...`);
        // Pass the callback down to populateDataFromJSON
        await populateDataFromJSON(db, setIsUpdating, setProgress);
        console.log(`Data refreshed for version ${DATABASE_VERSION}.`);

        // Only update version if data population was successful
        console.log(`Setting final database version to ${DATABASE_VERSION}...`);
        await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
        console.log(`Database version updated to ${DATABASE_VERSION}`);
      } catch (error) {
        console.error("Failed to refresh data:", error);
        // Don't update version if population failed
        throw error;
      }
    }

    console.log("Database migration completed successfully.");
  } catch (error) {
    console.error("Database migration failed:", error);
    throw error;
  } finally {
    setIsUpdating(false);
    if (setProgress) setProgress(1);
    console.log("Database migration process finished.");
  }
}
