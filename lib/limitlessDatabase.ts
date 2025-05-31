import * as SQLite from "expo-sqlite";

const LIMITLESS_DATABASE_NAME = "limitlessDecks.db";

// ----> INCREMENT THIS WHEN JSON CHANGES <----
const LIMITLESS_DATABASE_VERSION = 5; // Incremented due to schema change

// Import the JSON data file
const limitlessDecksData: Array<{
  id: number;
  name: string;
  variantOf: string | null;
  cards: string;
  thumbnail?: string;
  player?: string;
  tournament?: string;
}> = require("@/assets/database/limitlessDecks.json");

const BATCH_SIZE = 1000;

async function processBatch<T>(
  db: SQLite.SQLiteDatabase,
  items: T[],
  processFn: (batch: T[]) => Promise<void>,
  batchSize: number = BATCH_SIZE,
  itemName: string = "items"
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await db.withTransactionAsync(async () => {
      await processFn(batch);
    });
  }
}

// Populate limitlessDecks from JSON
async function populateLimitlessDecksFromJSON(db: SQLite.SQLiteDatabase) {
  // Clear existing data
  await db.execAsync("DELETE FROM limitlessDecks;");
  await db.execAsync("DELETE FROM sqlite_sequence WHERE name = 'limitlessDecks';");
  // Insert new data
  const insertStmt = await db.prepareAsync(
    "INSERT INTO limitlessDecks (id, name, variantOf, cards, thumbnail, player, tournament) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  try {
    await processBatch(
      db,
      limitlessDecksData,
      async (batch) => {
        for (const item of batch) {
          await insertStmt.executeAsync([
            item.id,
            item.name,
            item.variantOf ?? null,
            item.cards,
            item.thumbnail ?? null,
            item.player ?? null,
            item.tournament ?? null,
          ]);
        }
      },
      BATCH_SIZE,
      "limitless decks"
    );
  } finally {
    await insertStmt.finalizeAsync();
  }
}

export async function openLimitlessDatabase(): Promise<SQLite.SQLiteDatabase> {
  console.log(`Opening limitless database async: ${LIMITLESS_DATABASE_NAME}`);
  const db = await SQLite.openDatabaseAsync(LIMITLESS_DATABASE_NAME);
  await db.execAsync("PRAGMA journal_mode = WAL;");
  return db;
}

// Migration for limitlessDecks table (read-only, but ensure schema)
export async function migrateLimitlessDbIfNeeded(db: SQLite.SQLiteDatabase) {
  // Get current version
  const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let currentDbVersion = result?.user_version ?? 0;
  if (currentDbVersion >= LIMITLESS_DATABASE_VERSION) {
    return;
  }
  // Ensure schema (create table if not exists)
  await db.execAsync(`CREATE TABLE IF NOT EXISTS limitlessDecks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    variantOf TEXT,
    cards TEXT NOT NULL
  );`);
  // --- Add missing columns if needed ---
  const columns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(limitlessDecks)");
  const colNames = columns.map((c) => c.name);
  if (!colNames.includes("thumbnail")) {
    await db.execAsync("ALTER TABLE limitlessDecks ADD COLUMN thumbnail TEXT;");
  }
  if (!colNames.includes("player")) {
    await db.execAsync("ALTER TABLE limitlessDecks ADD COLUMN player TEXT;");
  }
  if (!colNames.includes("tournament")) {
    await db.execAsync("ALTER TABLE limitlessDecks ADD COLUMN tournament TEXT;");
  }
  // Populate from JSON if version is outdated
  await populateLimitlessDecksFromJSON(db);
  // Update version
  await db.execAsync(`PRAGMA user_version = ${LIMITLESS_DATABASE_VERSION}`);
}

// Read all decks
export async function getLimitlessDecks(db: SQLite.SQLiteDatabase): Promise<
  {
    id: number;
    name: string;
    variantOf: string | null;
    cards: string;
    thumbnail?: string;
    player?: string;
    tournament?: string;
  }[]
> {
  return db.getAllAsync(
    "SELECT id, name, variantOf, cards, thumbnail, player, tournament FROM limitlessDecks ORDER BY id ASC"
  );
}

// Read a single deck by id
export async function getLimitlessDeckById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<
  | {
      id: number;
      name: string;
      variantOf: string | null;
      cards: string;
      thumbnail?: string;
      player?: string;
      tournament?: string;
    }
  | undefined
> {
  const result = await db.getFirstAsync<any>(
    "SELECT id, name, variantOf, cards, thumbnail, player, tournament FROM limitlessDecks WHERE id = ?",
    [id]
  );
  if (!result || typeof result.id !== "number" || typeof result.name !== "string" || typeof result.cards !== "string") {
    return undefined;
  }
  return {
    id: result.id,
    name: result.name,
    variantOf: result.variantOf ?? null,
    cards: result.cards,
    thumbnail: result.thumbnail ?? undefined,
    player: result.player ?? undefined,
    tournament: result.tournament ?? undefined,
  };
}
