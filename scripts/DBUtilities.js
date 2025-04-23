const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.resolve(__dirname, "../db/pokemonCardsDB.sqlite");
const cardImagesDir = path.resolve(__dirname, "../assets/card-images");

// Function to update CardSet.ptcgoCode based on name
function updateCardSetCodes() {
  const nameToCode = [
    { name: "Journey Together", ptcgoCode: "JTG" },
    { name: "Prismatic Evolutions", ptcgoCode: "PRE" },
    { name: "Surging Sparks", ptcgoCode: "SSP" },
    { name: "Stellar Crown", ptcgoCode: "SCR" },
    { name: "Shrouded Fable", ptcgoCode: "SFA" },
    { name: "Twilight Masquerade", ptcgoCode: "TWM" },
    { name: "Temporal Forces", ptcgoCode: "TEF" },
    { name: "Paldean Fates", ptcgoCode: "PAF" },
    { name: "Paradox Rift", ptcgoCode: "PAR" },
    { name: "151", ptcgoCode: "MEW" },
    { name: "McDonald’s Match Battle 2023", ptcgoCode: "M23" },
    { name: "Obsidian Flames", ptcgoCode: "OBF" },
    { name: "Paldea Evolved", ptcgoCode: "PAL" },
    { name: "Scarlet & Violet Energies", ptcgoCode: "SVE" },
    { name: "Scarlet & Violet", ptcgoCode: "SVI" },
    { name: "Scarlet & Violet Promos", ptcgoCode: "SVP" },
  ];

  const db = new Database(dbPath);
  let updated = 0;
  for (const entry of nameToCode) {
    const result = db.prepare("UPDATE CardSet SET ptcgoCode = ? WHERE name = ?").run(entry.ptcgoCode, entry.name);
    if (result.changes > 0) updated++;
  }
  db.close();
  console.log(`Updated ${updated} CardSet rows with ptcgoCode.`);
}

// Function to update Card image paths
function updateCardImages() {
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
      "SELECT id, cardId, imagesSmall, imagesLarge FROM Card WHERE imagesSmall LIKE '%images.pokemontcg.io%' OR imagesLarge LIKE '%images.pokemontcg.io%'"
    )
    .all();

  let updated = 0;
  let missing = [];

  for (const card of cards) {
    let updateNeeded = false;
    let newSmall = card.imagesSmall;
    let newLarge = card.imagesLarge;

    if (card.imagesSmall && card.imagesSmall.includes("images.pokemontcg.io")) {
      const localSmall = getLocalImagePath(card.cardId, "small");
      if (localSmall) {
        newSmall = localSmall;
        updateNeeded = true;
      } else {
        missing.push(`${card.cardId}_small.webp`);
      }
    }
    if (card.imagesLarge && card.imagesLarge.includes("images.pokemontcg.io")) {
      const localLarge = getLocalImagePath(card.cardId, "large");
      if (localLarge) {
        newLarge = localLarge;
        updateNeeded = true;
      } else {
        missing.push(`${card.cardId}_large.webp`);
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
}

// Function to set convertedRetreatCost to 0 for Pokémon cards where it is null
function fixNullConvertedRetreatCost() {
  const db = new Database(dbPath);
  const result = db
    .prepare("UPDATE Card SET convertedRetreatCost = 0 WHERE supertype = 'Pokémon' AND convertedRetreatCost IS NULL")
    .run();
  db.close();
  console.log(`Set convertedRetreatCost = 0 for ${result.changes} Pokémon cards where it was null.`);
}

// CLI interface
if (require.main === module) {
  const arg = process.argv[2];
  if (arg === "update-images") {
    updateCardImages();
  } else if (arg === "update-cardset-codes") {
    updateCardSetCodes();
  } else if (arg === "fix-null-retreat-cost") {
    fixNullConvertedRetreatCost();
  } else {
    console.log("Usage: node localHelpers/DBUtilities.cjs [update-images|update-cardset-codes|fix-null-retreat-cost]");
  }
}
