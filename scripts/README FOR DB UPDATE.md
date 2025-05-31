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

5.  **Check if any card image is missing:**

    - Eventually run `node scripts/checkMissingCardImages.js` to seek for missing images.

6.  **Update Image Mapping:**

    - Run `node scripts/cardImagesMapping.js` to update the mapping from '/assets/card-images' in
      '/helpers/cardImageMapping.ts'.

7.  **Increment Database Version:**

    - Open the script: `lib/cardDatabase.ts`.
    - Find the `DATABASE_VERSION` constant near the top of the file.
    - Increment its value by 1.

# Updating Limitless Deck Database

1.  **Update Json Source:**

    - Run `node scripts/limitlessScraper.js` to update limitlessDecks.json (scripts/db) and deckLibraryMapping.ts (in
      helpers).

2.  **Update the Json '/assets/databse':**

    - Copy limitlessDecks.json in 'assets/database'.

3.  **Manually Update the deck/thumbnail map:**

    - Manually assign a thumbnail to each deck variant in 'helpers/deckLibraryMapping.ts'

4.  **Increment Database Version:**

    - Open the script: `lib/limitlessDatabase.ts`.
    - Find the `LIMITLESS_DATABASE_VERSION` constant near the top of the file.
    - Increment its value by 1.
