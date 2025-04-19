import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "../db/pokemonCardsDB.sqlite");
const db = new Database(dbPath);

function getUniqueValues(table, column) {
  const stmt = db.prepare(`SELECT DISTINCT ${column} FROM ${table} WHERE ${column} IS NOT NULL`);
  if (column === "subtypes") {
    const all = stmt.all().map((row) => {
      try {
        return Array.isArray(row[column]) ? row[column] : JSON.parse(row[column]);
      } catch {
        return [];
      }
    });
    return Array.from(new Set(all.flat().filter(Boolean)));
  }
  if (column === "types") {
    const all = stmt.all().map((row) => {
      try {
        return Array.isArray(row[column]) ? row[column] : JSON.parse(row[column]);
      } catch {
        return [];
      }
    });
    return Array.from(new Set(all.flat().filter(Boolean)));
  }
  return Array.from(
    new Set(
      stmt
        .all()
        .map((row) => row[column])
        .filter(Boolean)
    )
  );
}

const STAGE_POKEMON = ["Basic", "Stage 1", "Stage 2"];

const uniqueIdentifiers = {
  cardSupertype: getUniqueValues("Card", "supertype"),
  // Remove "Basic", "Stage 1", "Stage 2" from cardSubtypes
  cardSubtypes: getUniqueValues("Card", "subtypes").filter((s) => !STAGE_POKEMON.includes(s)),
  cardTypes: getUniqueValues("Card", "types"),
  cardRegulationMark: getUniqueValues("Card", "regulationMark"),
  cardSetNames: getUniqueValues("CardSet", "name"),
  cardSetSeries: getUniqueValues("CardSet", "series"),
  cardStagePokémon: STAGE_POKEMON,
};

// Get all rows with supertype and subtypes
const cardRows = db
  .prepare("SELECT supertype, subtypes FROM Card WHERE supertype IS NOT NULL AND subtypes IS NOT NULL")
  .all();

// Map: { supertype: Set of subtypes }
const supertypeToSubtypes = {};
for (const row of cardRows) {
  let subtypes = [];
  try {
    subtypes = Array.isArray(row.subtypes) ? row.subtypes : JSON.parse(row.subtypes);
  } catch {
    subtypes = [];
  }
  if (!Array.isArray(subtypes)) subtypes = [subtypes];
  const supertype = row.supertype;
  if (!supertypeToSubtypes[supertype]) supertypeToSubtypes[supertype] = new Set();
  // Remove stage Pokémon from subtypes
  subtypes.filter(Boolean).forEach((sub) => {
    if (!STAGE_POKEMON.includes(sub)) {
      supertypeToSubtypes[supertype].add(sub);
    }
  });
}

// Add cardSubtype*VAR* arrays to uniqueIdentifiers
for (const [supertype, subtypesSet] of Object.entries(supertypeToSubtypes)) {
  uniqueIdentifiers[`cardSubtype${supertype}`] = Array.from(subtypesSet);
}

const outPath = path.resolve(__dirname, "../db/uniqueIdentifiers.json");
fs.writeFileSync(outPath, JSON.stringify(uniqueIdentifiers, null, 2), "utf-8");
console.log("Unique identifiers written to db/uniqueIdentifiers.json");
