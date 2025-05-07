import * as SQLite from "expo-sqlite";

// ----> INCREMENT THIS WHEN SCHEMA CHANGES <----
const USER_DATABASE_VERSION = 4;

const USER_DATABASE_NAME = "userDatabase.db";

// Function to open or create the user database - now async
export async function openUserDatabase(): Promise<SQLite.SQLiteDatabase> {
  console.log(`Opening user database async: ${USER_DATABASE_NAME}`);
  const db = await SQLite.openDatabaseAsync(USER_DATABASE_NAME);
  return db;
}

// Function to handle user database migrations
export async function migrateUserDbIfNeeded(db: SQLite.SQLiteDatabase, setIsUpdating?: (isUpdating: boolean) => void) {
  try {
    // Optional state update at the start
    if (setIsUpdating) {
      setIsUpdating(true);
    }

    // Migration steps: each has a version and a function
    const migrations: { version: number; migrate: (db: SQLite.SQLiteDatabase) => Promise<void> }[] = [
      {
        version: 1,
        migrate: async (db) => {
          console.log("Applying version 1 user migration: Initial schema creation...");
          await db.execAsync(`
            PRAGMA journal_mode = WAL;

            CREATE TABLE IF NOT EXISTS Decks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              thumbnail TEXT,
              cards TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS WatchedCards (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              cardId TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS SavedQueries (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              formType TEXT NOT NULL CHECK(formType IN ('free', 'advanced')),
              queryParams TEXT NOT NULL,
              createdAt INTEGER NOT NULL DEFAULT strftime('%s','now')
            );
          `);
          console.log("Version 1 user migration complete: Created Decks, WatchedCards, and SavedQueries tables.");
        },
      },
      {
        version: 2,
        migrate: async (db) => {
          console.log("Applying next version user migration: Add thumbnail to Decks table...");
          const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(Decks)`);
          const hasThumbnailColumn = columns.some((col) => col.name === "thumbnail");
          if (!hasThumbnailColumn) {
            await db.execAsync(`ALTER TABLE Decks ADD COLUMN thumbnail TEXT;`);
            console.log("User migration complete.");
          } else {
            console.log("User migration: columns already exists.");
          }
        },
      },
    ];

    // Read the current version using getFirstAsync
    const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    let currentDbVersion = result?.user_version ?? 0;

    console.log(`Current User DB version: ${currentDbVersion}, Required User DB version: ${USER_DATABASE_VERSION}`);

    if (currentDbVersion >= USER_DATABASE_VERSION) {
      console.log("User database is up-to-date.");
      // Clean up state before returning
      if (setIsUpdating) {
        setIsUpdating(false);
      }
      return;
    }

    console.log(`Starting user database migration from version ${currentDbVersion} to ${USER_DATABASE_VERSION}...`);

    // Run all needed migrations in order
    for (const migration of migrations) {
      if (currentDbVersion < migration.version) {
        await migration.migrate(db);
        currentDbVersion = migration.version;
        await db.execAsync(`PRAGMA user_version = ${currentDbVersion}`);
        console.log(`Set user database version to ${currentDbVersion}`);
      }
    }

    // If more migrations were added but version constant is higher, set to final version
    if (currentDbVersion < USER_DATABASE_VERSION) {
      console.log(`Setting final user database version to ${USER_DATABASE_VERSION}...`);
      await db.execAsync(`PRAGMA user_version = ${USER_DATABASE_VERSION}`);
    }

    console.log("User database migration check finished.");
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
