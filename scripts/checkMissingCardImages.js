// scripts/checkMissingCardImages.js
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Path to your SQLite DB and images directory
const dbPath = path.resolve(__dirname, "../scripts/db/pokemonCardsDB.db");
const imagesDir = path.resolve(__dirname, "../assets/card-images");

// Open the database
const db = new Database(dbPath, { readonly: true });

// Query all imagesLarge values from the 'Card' table
const rows = db.prepare("SELECT imagesLarge FROM Card WHERE imagesLarge IS NOT NULL").all();
const dbImageFiles = rows
  .map((row) => {
    if (typeof row.imagesLarge === "string" && row.imagesLarge.trim() !== "") {
      const match = row.imagesLarge.match(/([^/]+)$/);
      return match ? match[1] : null;
    }
    return null;
  })
  .filter(Boolean);

// Read all image filenames in the directory
const imageFiles = fs.readdirSync(imagesDir);

// Build a Set of available image filenames
const availableImages = new Set(imageFiles);

// Find missing images
const missing = dbImageFiles.filter((filename) => !availableImages.has(filename));

console.log(`DB image files: ${dbImageFiles.length}`);
console.log(`Available images: ${imageFiles.length}`);
console.log(`Unique available images: ${availableImages.size}`);
console.log(`Missing images count: ${missing.length}`);
if (missing.length === 0) {
  console.log("All card images are present in assets/card-images.");
} else {
  console.log("Missing images for the following filenames:");
  missing.forEach((filename) => console.log(filename));
}

// Print any duplicate image filenames in the DB
const duplicates = dbImageFiles.filter((item, idx) => dbImageFiles.indexOf(item) !== idx);
if (duplicates.length > 0) {
  console.log("Duplicate image filenames in DB:");
  [...new Set(duplicates)].forEach((filename) => console.log(filename));
}

// Print any empty or invalid imagesLarge values
const invalidRows = rows.filter((row) => typeof row.imagesLarge !== "string" || row.imagesLarge.trim() === "");
if (invalidRows.length > 0) {
  console.log("Rows with empty or invalid imagesLarge values:");
  invalidRows.forEach((row) => console.log(row));
}
