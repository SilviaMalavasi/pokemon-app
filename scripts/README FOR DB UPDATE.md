# Updating the Local Card Database

1.  **Update Json Source:**

    - Run `node scripts/getRotationCardsFromAPI.js` to update rotationCards.json .

2.  **Update Master Database:**

    - Run `node scripts/fillDatabase.js` to update the sqlite database in  
      'scripts/db'.

3.  **Regenerate JSON Files:**

    - Run `node scripts/exportDbToJson.js` to update the json for each table in 'assets/database'.

4.  **Update Unique Identifiers:**

    - Run `node scripts/generateUniqueIdentifiers.js` to update the json for each table in 'assets/database'.

5.  **Increment Database Version:**

    - Open the migration script: `lib/cardDatabase.ts`.
    - Find the `DATABASE_VERSION` constant near the top of the `migrateDbIfNeeded` function.
    - Increment its value by 1 (e.g., if it was `1`, change it to `2`).
