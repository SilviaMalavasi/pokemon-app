import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "../db/pokemonCardsDB.sqlite");
const db = new Database(dbPath);

const tables = ["CardSet", "Abilities", "Attacks", "Card", "CardAbilities", "CardAttacks"];

const exportDir = path.resolve(__dirname, "../db/exportedCSV");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

function toCSV(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (v) =>
    typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n"))
      ? '"' + v.replace(/"/g, '""') + '"'
      : v;
  const header = keys.join(",");
  const data = rows.map((row) => keys.map((k) => escape(row[k] ?? "")).join(","));
  return [header, ...data].join("\n");
}

for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  const csv = toCSV(rows);
  fs.writeFileSync(path.join(exportDir, `${table}.csv`), csv, "utf-8");
}

console.log("Exported all tables to CSV in db/exportedCSV/");
