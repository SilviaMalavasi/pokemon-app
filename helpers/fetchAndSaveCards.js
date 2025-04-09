const axios = require("axios");
const fs = require("fs");

const API_URL = "https://api.pokemontcg.io/v2/cards";
const API_KEY = "your_api_key_here"; // Replace with your API key

async function fetchAndSaveCards() {
  try {
    console.log("Fetching Pokémon cards...");

    let allCards = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`Fetching page ${page}...`);

      // Fetch cards with regulationMark G or H for the current page
      const response = await axios.get(API_URL, {
        headers: {
          "X-Api-Key": API_KEY,
        },
        params: {
          q: 'regulationMark:"G" OR regulationMark:"H"', // Query for regulationMark G or H
          pageSize: 250, // Fetch up to 250 cards per page
          page, // Current page
        },
      });

      const cards = response.data.data;
      allCards = allCards.concat(cards); // Add the cards to the list

      // Check if there are more pages
      hasMore = cards.length === 250; // If less than 250 cards, we've reached the last page
      page++; // Increment the page number
    }

    console.log(`Found ${allCards.length} cards with regulation marks G or H.`);

    // Write all the filtered cards to a file
    fs.writeFileSync("filteredCards.json", JSON.stringify(allCards, null, 2));
    console.log("Filtered cards saved to filteredCards.json");
  } catch (error) {
    console.error("Error fetching or saving cards:", error);
  }
}

fetchAndSaveCards();
