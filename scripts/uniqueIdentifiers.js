const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.resolve(__dirname, "../db/pokemonCardsDB.sqlite");
const db = new Database(dbPath);

function getUniqueValues(table, column) {
  const stmt = db.prepare(`SELECT DISTINCT ${column} FROM ${table} WHERE ${column} IS NOT NULL`);
  if (column === "subtypes" || column === "types") {
    const all = stmt.all().map((row) => {
      try {
        return Array.isArray(row[column]) ? row[column] : JSON.parse(row[column]);
      } catch {
        return [];
      }
    });
    return Array.from(new Set(all.flat().filter(Boolean)));
  }
  if (column === "weaknesses" || column === "resistances") {
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

// Helper to get subtypes by supertype
function getSubtypesBySupertype() {
  const stmt = db.prepare("SELECT supertype, subtypes FROM Card WHERE subtypes IS NOT NULL AND supertype IS NOT NULL");
  const result = stmt.all();
  const subtypeMap = {
    Pokémon: new Set(),
    Trainer: new Set(),
    Energy: new Set(),
  };
  result.forEach(({ supertype, subtypes }) => {
    let subArr;
    try {
      subArr = Array.isArray(subtypes) ? subtypes : JSON.parse(subtypes);
    } catch {
      subArr = [];
    }
    subArr.forEach((sub) => {
      if (["Basic", "Stage 1", "Stage 2"].includes(sub)) return; // skip stages
      if (subtypeMap[supertype]) {
        subtypeMap[supertype].add(sub);
      }
    });
  });
  return {
    cardSubtypePokémon: Array.from(subtypeMap["Pokémon"]),
    cardSubtypeTrainer: Array.from(subtypeMap["Trainer"]),
    cardSubtypeEnergy: Array.from(subtypeMap["Energy"]),
  };
}

const subtypesBySupertype = getSubtypesBySupertype();

const uniqueIdentifiers = {
  cardSupertype: getUniqueValues("Card", "supertype"),
  cardStagePokémon: ["Basic", "Stage 1", "Stage 2"],
  cardSubtypePokémon: subtypesBySupertype.cardSubtypePokémon,
  cardSubtypeTrainer: subtypesBySupertype.cardSubtypeTrainer,
  cardSubtypeEnergy: subtypesBySupertype.cardSubtypeEnergy,
  cardTypes: getUniqueValues("Card", "types"),
  cardRegulationMark: getUniqueValues("Card", "regulationMark"),
  cardSetNames: getUniqueValues("CardSet", "name"),
  cardSetSeries: getUniqueValues("CardSet", "series"),
  cardWeaknessTypes: getUniqueValues("Card", "weaknesses"),
  cardResistanceTypes: getUniqueValues("Card", "resistances"),
};

const outPath = path.resolve(__dirname, "../db/uniqueIdentifiers.json");
fs.writeFileSync(outPath, JSON.stringify(uniqueIdentifiers, null, 2), "utf-8");
console.log("Unique identifiers written to db/uniqueIdentifiers.json");
