const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Define paths relative to the script location (helpers/)
const dbPath = path.join(__dirname, "..", "assets", "database", "pokemonCardsDB.db"); // Go up one level, then to assets/database
const outputDir = path.join(__dirname, "..", "assets", "database"); // Go up one level, then to assets/database/data
const tablesToExport = ["CardSet", "Abilities", "Attacks", "Card", "CardAbilities", "CardAttacks"]; // Add other table names if needed

console.log(`Source DB: ${dbPath}`);
console.log(`Output Directory: ${outputDir}`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  console.log(`Creating output directory: ${outputDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
}

let db;
try {
  // Check if DB file exists
  if (!fs.existsSync(dbPath)) {
    console.error(`Error: Database file not found at ${dbPath}`);
    process.exit(1); // Exit if DB doesn't exist
  }

  // Open the database
  db = new Database(dbPath, { readonly: true, fileMustExist: true });
  console.log("Database opened successfully.");

  // Export each table
  tablesToExport.forEach((tableName) => {
    try {
      console.log(`Exporting table: ${tableName}...`);
      const stmt = db.prepare(`SELECT * FROM ${tableName}`);
      const rows = stmt.all();
      const outputPath = path.join(outputDir, `${tableName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2)); // Pretty print JSON
      console.log(`Successfully exported ${rows.length} rows from ${tableName} to ${outputPath}`);
    } catch (tableError) {
      console.error(`Error exporting table ${tableName}:`, tableError.message);
      // Continue to next table even if one fails
    }
  });

  console.log("Database export completed.");
} catch (error) {
  console.error("Failed to export database:", error.message);
  process.exit(1); // Exit on general failure
} finally {
  // Ensure the database connection is closed
  if (db) {
    db.close();
    console.log("Database connection closed.");
  }
}
