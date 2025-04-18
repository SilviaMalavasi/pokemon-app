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

const uniqueIdentifiers = {
  cardSupertype: getUniqueValues("Card", "supertype"),
  cardSubtypes: getUniqueValues("Card", "subtypes"),
  cardTypes: getUniqueValues("Card", "types"),
  cardRegulationMark: getUniqueValues("Card", "regulationMark"),
  cardSetNames: getUniqueValues("CardSet", "name"),
  cardSetSeries: getUniqueValues("CardSet", "series"),
};

const outPath = path.resolve(__dirname, "../db/uniqueIdentifiers.json");
fs.writeFileSync(outPath, JSON.stringify(uniqueIdentifiers, null, 2), "utf-8");
console.log("Unique identifiers written to db/uniqueIdentifiers.json");
