import * as SQLite from "expo-sqlite";

// ----> INCREMENT THIS WHEN SCHEMA CHANGES <----
const USER_DATABASE_VERSION = 27;
// Set to false; we will force reset only if a mismatch is detected
const FORCE_USER_DB_RESET = false; // TEMP: Set to false after first run!

const USER_DATABASE_NAME = "userDatabase.db";

// Function to open or create the user database - now async
export async function openUserDatabase(): Promise<SQLite.SQLiteDatabase> {
  console.log(`Opening user database async: ${USER_DATABASE_NAME}`);
  const db = await SQLite.openDatabaseAsync(USER_DATABASE_NAME);
  // Set WAL mode immediately after opening, before any migrations
  await db.execAsync("PRAGMA journal_mode = WAL;");
  return db;
}

// Define the desired schema for each table
const desiredTables = [
  {
    name: "Decks",
    columns: [
      { name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
      { name: "name", type: "TEXT NOT NULL" },
      { name: "thumbnail", type: "TEXT" },
      { name: "cards", type: "TEXT" },
    ],
  },
  {
    name: "WatchedCards",
    columns: [
      { name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
      { name: "name", type: "TEXT NOT NULL" },
      { name: "cards", type: "TEXT" },
    ],
  },
];

// Function to handle user database migrations
export async function migrateUserDbIfNeeded(db: SQLite.SQLiteDatabase, setIsUpdating?: (isUpdating: boolean) => void) {
  let detectedMismatch = false;
  try {
    if (setIsUpdating) setIsUpdating(true);
    // --- GENERIC MIGRATION: Ensure all required tables and columns exist ---
    // Check for schema mismatches
    for (const table of desiredTables) {
      try {
        const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table.name})`);
        const colNames = cols.map((c) => c.name);
        const expectedColNames = table.columns.map((c) => c.name);
        // Check for missing or extra columns
        const missing = expectedColNames.filter((c) => !colNames.includes(c));
        const extra = colNames.filter((c) => !expectedColNames.includes(c));
        if (missing.length > 0 || extra.length > 0) {
          detectedMismatch = true;
          console.warn(`[SCHEMA MISMATCH] Table ${table.name}: missing columns: ${missing}, extra columns: ${extra}`);
        }
      } catch (e) {
        // If table doesn't exist, treat as mismatch
        detectedMismatch = true;
        console.warn(`[SCHEMA MISMATCH] Table ${table.name} does not exist or error reading columns.`);
      }
    }

    // If mismatch detected, force reset
    if (detectedMismatch) {
      console.warn("[FORCE RESET] Schema mismatch detected, dropping Decks and WatchedCards tables!");
      await db.execAsync("DROP TABLE IF EXISTS Decks");
      await db.execAsync("DROP TABLE IF EXISTS WatchedCards");
    }

    console.log("[MIGRATION] Starting user DB migration");
    // --- GENERIC MIGRATION: Ensure all required tables and columns exist ---
    // Print current columns before migration
    for (const table of desiredTables) {
      try {
        const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table.name})`);
        console.log(
          `[MIGRATION] Before: Columns in ${table.name}:`,
          cols.map((c) => c.name)
        );
      } catch (e) {
        console.error(`[MIGRATION] Error reading columns for ${table.name}:`, e);
      }
    }

    const watchedCols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(WatchedCards)`);
    const hasCardIdCol = watchedCols.some((col) => col.name === "cardId");
    if (hasCardIdCol) {
      console.warn("Legacy 'cardId' column found in WatchedCards. Migrating schema...");
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS WatchedCards_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          cards TEXT
        );
      `);
      await db.execAsync(`
        INSERT INTO WatchedCards_new (id, name, cards)
        SELECT id, name, cards FROM WatchedCards
      `);
      await db.execAsync("DROP TABLE WatchedCards");
      await db.execAsync("ALTER TABLE WatchedCards_new RENAME TO WatchedCards");
      console.log("WatchedCards schema migration complete.");
    }

    for (const table of desiredTables) {
      // Create table if it doesn't exist
      const columnsDef = table.columns.map((c) => `${c.name} ${c.type}`).join(", ");
      await db.execAsync(`CREATE TABLE IF NOT EXISTS ${table.name} (${columnsDef});`);
      // Get current columns
      const currentCols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table.name})`);
      for (const col of table.columns) {
        if (!currentCols.some((c) => c.name === col.name)) {
          await db.execAsync(`ALTER TABLE ${table.name} ADD COLUMN ${col.name} ${col.type}`);
          console.log(`[MIGRATION] Added column ${col.name} to ${table.name}`);
        }
      }
    }

    // Print current columns after migration
    for (const table of desiredTables) {
      try {
        const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table.name})`);
        console.log(
          `[MIGRATION] After: Columns in ${table.name}:`,
          cols.map((c) => c.name)
        );
      } catch (e) {
        console.error(`[MIGRATION] Error reading columns for ${table.name} after migration:`, e);
      }
    }

    // Read the current version using getFirstAsync
    const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    let currentDbVersion = result?.user_version ?? 0;
    console.log(`[MIGRATION] Current user_version: ${currentDbVersion}, expected: ${USER_DATABASE_VERSION}`);
    if (currentDbVersion < USER_DATABASE_VERSION) {
      await db.execAsync(`PRAGMA user_version = ${USER_DATABASE_VERSION}`);
      console.log(`[MIGRATION] Set user database version to ${USER_DATABASE_VERSION}`);
    }
    console.log("[MIGRATION] User database migration check finished.");
  } catch (err) {
    console.error("[MIGRATION] Error during user DB migration:", err);
    throw err;
  } finally {
    // Always clean up state
    if (setIsUpdating) {
      setIsUpdating(false);
    }
  }
}

// --- Deck Management Functions ---

export async function addDeck(
  db: SQLite.SQLiteDatabase,
  name: string,
  thumbnail?: string,
  cards: string = "[]"
): Promise<SQLite.SQLiteRunResult> {
  console.log(`Adding deck: ${name}, Thumbnail: ${thumbnail}`);
  return db.runAsync("INSERT INTO Decks (name, thumbnail, cards) VALUES (?, ?, ?)", [name, thumbnail ?? null, cards]);
}

export async function getSavedDecks(
  db: SQLite.SQLiteDatabase
): Promise<{ id: number; name: string; thumbnail: string | null; cards: string }[]> {
  console.log("Fetching all saved decks.");
  return db.getAllAsync<{ id: number; name: string; thumbnail: string | null; cards: string }>(
    "SELECT id, name, thumbnail, cards FROM Decks ORDER BY name ASC"
  );
}

// Delete a deck by ID
export async function deleteDeck(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  console.log(`Deleting deck with id: ${id}`);
  await db.runAsync("DELETE FROM Decks WHERE id = ?", [id]);
}

// --- WatchList Management Functions ---

export async function addWatchList(
  db: SQLite.SQLiteDatabase,
  name: string,
  cards: string = "[]"
): Promise<SQLite.SQLiteRunResult> {
  console.log(`Adding watch list: ${name}`);
  return db.runAsync("INSERT INTO WatchedCards (name, cards) VALUES (?, ?)", [name, cards]);
}

export async function getWatchLists(db: SQLite.SQLiteDatabase): Promise<{ id: number; name: string; cards: string }[]> {
  console.log("Fetching all watch lists.");
  return db.getAllAsync<{ id: number; name: string; cards: string }>(
    "SELECT id, name, cards FROM WatchedCards ORDER BY name ASC"
  );
}

export async function deleteWatchList(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  console.log(`Deleting watch list with id: ${id}`);
  await db.runAsync("DELETE FROM WatchedCards WHERE id = ?", [id]);
}
