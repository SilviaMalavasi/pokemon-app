import * as SQLite from "expo-sqlite";

const USER_DATABASE_NAME = "userDatabase.db";

// Function to open or create the user database - now async
export async function openUserDatabase(): Promise<SQLite.SQLiteDatabase> {
  console.log(`Opening user database async: ${USER_DATABASE_NAME}`);
  const db = await SQLite.openDatabaseAsync(USER_DATABASE_NAME);
  return db;
}

// Function to handle user database migrations
export async function migrateUserDbIfNeeded(db: SQLite.SQLiteDatabase) {
  // ----> INCREMENT THIS WHEN SCHEMA CHANGES <----
  const USER_DATABASE_VERSION = 1; // Start with version 1

  // Read the current version using getFirstAsync
  const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let currentDbVersion = result?.user_version ?? 0;

  console.log(`Current User DB version: ${currentDbVersion}, Required User DB version: ${USER_DATABASE_VERSION}`);

  if (currentDbVersion >= USER_DATABASE_VERSION) {
    console.log("User database is up-to-date.");
    return;
  }

  console.log(`Starting user database migration from version ${currentDbVersion} to ${USER_DATABASE_VERSION}...`);

  // --- Migration Steps ---

  // Step 1: Initial Schema Creation (Only if db is brand new)
  if (currentDbVersion < 1) {
    console.log("Applying version 1 user migration: Initial schema creation...");

    // Use execAsync for PRAGMA and initial CREATE TABLE statements
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      -- Create the Decks table
      CREATE TABLE IF NOT EXISTS Decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cards TEXT NOT NULL -- Store as JSON: '[{"cardId": "sv1-1", "count": 2}, ...]' 
      );

      -- Create the WatchedCards table
      CREATE TABLE IF NOT EXISTS WatchedCards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cardId TEXT NOT NULL -- Relates to Card.cardId from the main DB (e.g., "sv1-1")
      );

      -- Create the SavedQueries table
      CREATE TABLE IF NOT EXISTS SavedQueries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        formType TEXT NOT NULL CHECK(formType IN ('free', 'advanced')), -- 'free' or 'advanced'
        queryParams TEXT NOT NULL, -- JSON string of search parameters
      );
    `);

    console.log("Version 1 user migration complete: Created Decks, WatchedCards, and SavedQueries tables."); // Updated log
  }

  // --- Add future migration steps here using 'if (currentDbVersion < X)' blocks ---
  // if (currentDbVersion < 2) {
  //   console.log("Applying version 2 user migration...");
  //   await db.execAsync(`
  //     -- Add ALTER TABLE or other migration logic for version 2
  //   `);
  //   console.log("Version 2 user migration complete.");
  // }

  // --- Set Final Version ---
  // Use execAsync to set the final version PRAGMA
  if (currentDbVersion < USER_DATABASE_VERSION) {
    console.log(`Setting final user database version to ${USER_DATABASE_VERSION}...`);
    await db.execAsync(`PRAGMA user_version = ${USER_DATABASE_VERSION}`);
  }

  console.log("User database migration check finished.");
}

// Example of how to get the user DB instance (you'll integrate this into your app logic)
// async function initializeUserDatabase() {
//   const userDb = await openUserDatabase(); // Now uses await
//   await migrateUserDbIfNeeded(userDb);
//   // Now userDb is ready to use
//   return userDb;
// }
