// For updating manually downloaded card images in the database

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "db/pokemonCardsDB.sqlite");
const cardImagesDir = path.resolve(process.cwd(), "public/card-images");

const db = new Database(dbPath);

function getLocalImagePath(cardId, size) {
  // size: 'small' or 'large'
  const filename = `${cardId}_${size}.webp`;
  const absPath = path.join(cardImagesDir, filename);
  if (fs.existsSync(absPath)) {
    return `/card-images/${filename}`;
  }
  return null;
}

const cards = db
  .prepare(
    "SELECT id, imagesSmall, imagesLarge FROM Card WHERE imagesSmall LIKE '%images.pokemontcg.io%' OR imagesLarge LIKE '%images.pokemontcg.io%'"
  )
  .all();

let updated = 0;
let missing = [];

for (const card of cards) {
  let updateNeeded = false;
  let newSmall = card.imagesSmall;
  let newLarge = card.imagesLarge;

  if (card.imagesSmall && card.imagesSmall.includes("images.pokemontcg.io")) {
    const localSmall = getLocalImagePath(card.id, "small");
    if (localSmall) {
      newSmall = localSmall;
      updateNeeded = true;
    } else {
      missing.push(`${card.id}_small.webp`);
    }
  }
  if (card.imagesLarge && card.imagesLarge.includes("images.pokemontcg.io")) {
    const localLarge = getLocalImagePath(card.id, "large");
    if (localLarge) {
      newLarge = localLarge;
      updateNeeded = true;
    } else {
      missing.push(`${card.id}_large.webp`);
    }
  }

  if (updateNeeded) {
    db.prepare("UPDATE Card SET imagesSmall = ?, imagesLarge = ? WHERE id = ?").run(newSmall, newLarge, card.id);
    updated++;
  }
}

db.close();

console.log(`Updated ${updated} card image paths.`);
if (missing.length > 0) {
  console.log("Missing local image files:");
  missing.forEach((f) => console.log(f));
}
