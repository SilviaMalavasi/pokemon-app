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
  const USER_DATABASE_VERSION = 3;

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
        thumbnail TEXT,
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
        createdAt INTEGER NOT NULL DEFAULT strftime('%s','now') -- Timestamp of creation
      );
    `);

    console.log("Version 1 user migration complete: Created Decks, WatchedCards, and SavedQueries tables."); // Updated log
  }

  // --- Add future migration steps here using 'if (currentDbVersion < X)' blocks ---
  if (currentDbVersion < 2) {
    console.log("Applying version 2 user migration: Add thumbnail to Decks table...");
    // Check if the column already exists before trying to add it
    // This is good practice for robustness, though less critical if versions are managed strictly
    const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(Decks)`);
    const hasThumbnailColumn = columns.some((col) => col.name === "thumbnail");

    if (!hasThumbnailColumn) {
      await db.execAsync(`
        ALTER TABLE Decks ADD COLUMN thumbnail TEXT;
      `);
      console.log("Version 2 user migration complete: Added thumbnail column to Decks.");
    } else {
      console.log("Version 2 user migration: Thumbnail column already exists.");
    }
  }

  // --- Set Final Version ---
  // Use execAsync to set the final version PRAGMA
  if (currentDbVersion < USER_DATABASE_VERSION) {
    console.log(`Setting final user database version to ${USER_DATABASE_VERSION}...`);
    await db.execAsync(`PRAGMA user_version = ${USER_DATABASE_VERSION}`);
  }

  console.log("User database migration check finished.");
}

// --- Deck Management Functions ---

/**
 * Adds a new deck to the Decks table.
 * @param db The SQLite database instance.
 * @param name The name of the deck.
 * @param thumbnail The thumbnail for the deck (optional).
 * @param cards A JSON string representing the cards in the deck (defaults to '[]').
 * @returns Promise<SQLite.SQLiteRunResult>
 */
export async function addDeck(
  db: SQLite.SQLiteDatabase,
  name: string,
  thumbnail?: string,
  cards: string = "[]"
): Promise<SQLite.SQLiteRunResult> {
  console.log(`Adding deck: ${name}, Thumbnail: ${thumbnail}`);
  return db.runAsync("INSERT INTO Decks (name, thumbnail, cards) VALUES (?, ?, ?)", [name, thumbnail ?? null, cards]);
}

/**
 * Retrieves all saved decks from the Decks table.
 * @param db The SQLite database instance.
 * @returns Promise<{ id: number; name: string; thumbnail: string | null; cards: string }[]>
 */
export async function getSavedDecks(
  db: SQLite.SQLiteDatabase
): Promise<{ id: number; name: string; thumbnail: string | null; cards: string }[]> {
  console.log("Fetching all saved decks.");
  return db.getAllAsync<{ id: number; name: string; thumbnail: string | null; cards: string }>(
    "SELECT id, name, thumbnail, cards FROM Decks ORDER BY name ASC"
  );
}
