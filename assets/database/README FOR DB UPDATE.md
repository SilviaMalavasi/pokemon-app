# Updating the Local Card Database

Follow these steps when you need to update the card data included in the app:

1.  **Update Master Database:**

    - Make the necessary changes (adding new cards, removing old ones, correcting data) directly in the
      `assets/database/pokemonCardsDB.db` SQLite file using a database tool (like DB Browser for SQLite).

2.  **Regenerate JSON Files:**

    - Open your terminal in the project root (`pokemon-deck-builder`).
    - Run the export script:
      ```
      node scripts/exportDbToJsonForMigration.js
      ```
    - This will overwrite the `.json` files in this directory (`Card.json`, `CardSet.json`, etc.) with the latest data
      from `pokemonCardsDB.db`.
    - Verify the JSON files have been updated (e.g., check file modification dates or use git diff).

3.  **Increment Database Version:**

    - Open the migration script: `lib/sqlite.ts`.
    - Find the `DATABASE_VERSION` constant near the top of the `migrateDbIfNeeded` function.
    - Increment its value by 1 (e.g., if it was `1`, change it to `2`).

4
