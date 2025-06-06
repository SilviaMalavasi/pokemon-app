// getAllBasicEnergy.js
// Script to fetch all Basic Energy cards from every edition using the Pokémon TCG API
// Outputs a map of { name, ptcgoCode } for each card to scripts/db/basicEnergyMap.json

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "https://api.pokemontcg.io/v2/";
const API_KEY = "cbd6ce55-f9f6-40c4-8002-63bcb558ecae"; // Add your API key if needed

const outputPath = path.resolve(__dirname, "db/basicEnergyMap.json");

async function getAllBasicEnergy() {
  let allCards = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get(`${API_URL}cards`, {
      headers: {
        "X-Api-Key": API_KEY,
      },
      params: {
        q: 'supertype:"Energy" subtypes:"Basic"',
        pageSize: 250,
        page,
      },
    });
    const cards = response.data.data;
    allCards = allCards.concat(cards);
    hasMore = cards.length === 250;
    page++;
  }

  // Map to { name, ptcgoCode } for each card
  // ptcgoCode is card.set.ptcgoCode + '-' + card.number
  const energyMap = allCards.map((card) => ({
    name: card.name,
    ptcgoCode: card.set && card.set.ptcgoCode && card.number ? `${card.set.ptcgoCode}-${card.number}` : null,
  }));

  fs.writeFileSync(outputPath, JSON.stringify(energyMap, null, 2), "utf-8");
  console.log(`Wrote ${energyMap.length} basic energy cards to ${outputPath}`);
}

getAllBasicEnergy();
