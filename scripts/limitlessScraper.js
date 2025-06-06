// limitlessScraper.js
// Script to scrape LimitlessTCG deck data and build a SQLite DB for limitlessDecks
// Usage: node limitlessScraper.js <url> (or modify for batch)

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// --- CONFIG ---
// Set the minimum allowed tournament date (inclusive). Format: 'YYYY-MM-DD'
const MIN_TOURNAMENT_DATE = new Date("2025-04-11"); // <-- Set your cutoff date here

// --- SCRAPER LOGIC ---
async function scrapeLimitlessDeck(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  // Example selectors, adjust as needed for LimitlessTCG
  const name = $("h1.deck-title, .deck-title").first().text().trim();
  const variant = $(".deck-variant, .deck-archetype").first().text().trim() || null;

  // Cards: try to find a table or list with cardId and quantity
  // This is a placeholder, you must adjust selectors to match LimitlessTCG
  const cards = [];
  $(".decklist-table tr").each((i, el) => {
    const qty = parseInt($(el).find(".qty, .decklist-qty").text().trim(), 10);
    const cardId = $(el).find(".card-id, .decklist-cardid").text().trim();
    if (qty && cardId) cards.push({ cardId, quantity: qty });
  });
  // Fallback: try to parse from text
  if (cards.length === 0) {
    $(".decklist-table tr").each((i, el) => {
      const txt = $(el).text();
      const match = txt.match(/(\d+)\s+([A-Z0-9\-]+)/);
      if (match) cards.push({ cardId: match[2], quantity: parseInt(match[1], 10) });
    });
  }

  // Store as JSON string (like user DB)
  const cardsString = JSON.stringify(cards);
  return { name, variant, cards: cardsString };
}

// Scrape all decks from a single deck list page (pagination page)
async function scrapeDecksFromListPage(listUrl) {
  const { data } = await axios.get(listUrl);
  const $ = cheerio.load(data);
  const decks = [];
  // Only look inside the main data-table
  $("table.data-table tr").each((i, el) => {
    const a = $(el).find("a[href^='/decks/']");
    if (a.length > 0) {
      const href = a.attr("href");
      // Get full variant family name, including annotation spans
      let variantOf = a.text().trim();
      // Find all img alts in the row for deck name
      const imgAlts = [];
      $(el)
        .find("img.pokemon")
        .each((j, img) => {
          const alt = $(img).attr("alt");
          if (alt) imgAlts.push(alt);
        });
      const name = imgAlts;
      if (href && name.length && variantOf) {
        decks.push({
          url: "https://limitlesstcg.com" + href,
          name,
          variantOf,
        });
      }
    }
  });
  return decks;
}

// Scrape all deck links from all paginated pages on LimitlessTCG decks list
async function scrapeAllDeckLinks(listUrl) {
  const { data } = await axios.get(listUrl);
  const $ = cheerio.load(data);
  // Find max page from pagination
  let maxPage = 1;
  const pagination = $("ul.pagination");
  if (pagination.length > 0) {
    const maxAttr = pagination.attr("data-max");
    if (maxAttr) maxPage = parseInt(maxAttr, 10);
    else {
      // Fallback: get max from li[data-target]
      pagination.find("li[data-target]").each((i, el) => {
        const n = parseInt($(el).attr("data-target"), 10);
        if (n > maxPage) maxPage = n;
      });
    }
  }
  // Get base url (without ?page=)
  let baseUrl = listUrl.split("?")[0];
  // Collect all deck links from all pages
  let allDecks = [];
  let deckLimit = Infinity; // Remove limit for production
  let deckCount = 0;
  for (let page = 1; page <= maxPage; page++) {
    if (deckCount >= deckLimit) break;
    let url = baseUrl + (page > 1 ? `?page=${page}` : "");
    const decks = await scrapeDecksFromListPage(url);
    for (const deck of decks) {
      if (deckCount < deckLimit) {
        allDecks.push(deck);
        deckCount++;
      } else {
        break;
      }
    }
    if (deckCount >= deckLimit) break;
    console.log(`Found ${decks.length} decks on page ${page}/${maxPage}`);
  }
  return allDecks;
}

// --- DB INSERT ---
function saveDeckToJson(deck, outPath = path.join("..", "assets", "database", "LimitlessDecks.json"), reset = false) {
  const file = path.join(__dirname, outPath);
  let arr = [];
  // If reset is true, always start with an empty array
  if (!reset && fs.existsSync(file)) {
    try {
      arr = JSON.parse(fs.readFileSync(file, "utf-8"));
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }
  }
  // Assign id sequentially (simulate AUTOINCREMENT)
  const nextId = arr.length > 0 ? Math.max(...arr.map((d) => d.id || 0)) + 1 : 1;
  const entry = {
    id: nextId,
    name: Array.isArray(deck.name) ? deck.name : [],
    variantOf: deck.variant || deck.variantOf || null,
    cards: deck.cards || "[]",
    thumbnail: deck.thumbnail || "",
    // Add player and tournament if present
    ...(deck.player ? { player: deck.player } : {}),
    ...(deck.tournament ? { tournament: deck.tournament } : {}),
  };
  arr.push(entry);
  fs.writeFileSync(file, JSON.stringify(arr, null, 2), "utf-8");
  console.log(`Deck written to ${file}`);
}

// --- CARD ID MAPPING LOGIC (INLINE) ---
// Map a single deck's cards array to app's internal cardId format
function mapCardIdsForCardsArray(cardsArr, ptcgoToSetId, setNumToCardId) {
  for (const card of cardsArr) {
    if (typeof card.cardId === "string" && card.cardId.match(/^[A-Z0-9\-]+$/)) {
      const [ptcgoCode, ...numParts] = card.cardId.split("-");
      const number = numParts.join("-");
      const setId = ptcgoToSetId[ptcgoCode];
      if (setId) {
        const appCardId = setNumToCardId[`${setId}-${number}`];
        if (appCardId) {
          card.cardId = appCardId;
        } else {
          card.cardId = `MISSING-${ptcgoCode}-${number}`;
        }
      } else {
        card.cardId = `MISSINGSET-${ptcgoCode}-${number}`;
      }
    }
  }
  return cardsArr;
}

// --- DECK LIBRARY MAPPING GENERATOR ---
function updateDeckLibraryMappingFromJson(jsonPath, mappingPath) {
  const decks = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const variantSet = new Set();
  for (const deck of decks) {
    if (deck.variantOf) variantSet.add(deck.variantOf);
  }
  // Read existing mapping if present
  let mapping = {};
  if (fs.existsSync(mappingPath)) {
    try {
      // Remove export lines and parse as JS object
      const raw = fs.readFileSync(mappingPath, "utf-8");
      const match = raw.match(/const deckLibraryMapping: DeckLibraryMapping = (\{[\s\S]*?\});/);
      if (match) {
        mapping = eval("(" + match[1] + ")");
      }
    } catch {}
  }
  // Add new variantOf keys if missing, keep existing thumbnails
  let updated = false;
  for (const variant of variantSet) {
    if (!mapping[variant]) {
      mapping[variant] = { thumbnail: "" };
      updated = true;
    }
  }
  // Remove old keys not in current variants
  for (const key of Object.keys(mapping)) {
    if (!variantSet.has(key)) {
      delete mapping[key];
      updated = true;
    }
  }
  // At this point, mapping[variant] will keep its thumbnail if already set
  if (updated) {
    // Write as a TypeScript file
    const out = `// helpers/deckLibraryMapping.ts\n// This file maps each unique variant family (variantOf) from LimitlessDecks to a thumbnail image.\n// Fill in the thumbnail for each variant family manually.\n\nexport interface DeckLibraryMapping {\n  [variantOf: string]: {\n    thumbnail: string; // e.g. 'sv1-1_large.webp' or a custom image path\n  };\n}\n\nconst deckLibraryMapping: DeckLibraryMapping = ${JSON.stringify(
      mapping,
      null,
      2
    )};\n\nexport default deckLibraryMapping;\n`;
    fs.writeFileSync(mappingPath, out, "utf-8");
    console.log(`Updated deck library mapping at ${mappingPath}`);
  } else {
    console.log("Deck library mapping is up to date.");
  }
}

// --- AUTO-ASSIGN THUMBNAILS TO DECKS ---
function autoAssignThumbnailsToDecks() {
  const decksPath = path.join(__dirname, "..", "assets", "database", "LimitlessDecks.json");
  const cardsPath = path.join(__dirname, "..", "assets", "database", "Card.json");
  if (!fs.existsSync(decksPath) || !fs.existsSync(cardsPath)) {
    console.error("LimitlessDecks.json or Card.json not found.");
    return;
  }
  const decks = JSON.parse(fs.readFileSync(decksPath, "utf-8"));
  const cards = JSON.parse(fs.readFileSync(cardsPath, "utf-8"));
  let updated = false;
  for (const deck of decks) {
    if (Array.isArray(deck.name) && typeof deck.variantOf === "string" && (!deck.thumbnail || deck.thumbnail === "")) {
      if (deck.name.length === 1) {
        // --- SINGLE NAME LOGIC (as before) ---
        const deckName = deck.name[0];
        const variantOfLower = deck.variantOf.toLowerCase();
        const deckNameLower = deckName.toLowerCase();
        let searchTerm = deckName;
        let match = null;
        if (variantOfLower.includes(deckNameLower)) {
          searchTerm = deck.variantOf;
          // Try to find card by variantOf
          match = cards.find((c) => typeof c.name === "string" && c.name.toLowerCase() === searchTerm.toLowerCase());
          // Fallback: if not found, try deck name
          if (!match) {
            searchTerm = deckName;
            match = cards.find((c) => typeof c.name === "string" && c.name.toLowerCase() === searchTerm.toLowerCase());
          }
        } else {
          // Use deck name as search term
          match = cards.find((c) => typeof c.name === "string" && c.name.toLowerCase() === searchTerm.toLowerCase());
        }
        if (match && match.cardId) {
          deck.thumbnail = `${match.cardId}_large.webp`;
          updated = true;
        }
      } else if (deck.name.length >= 2) {
        // --- MULTI-NAME LOGIC: always use the second string ---
        const mainName = deck.name[1]; // Use the second string, even if more than 2
        // Parse deck.cards (stringified array)
        let deckCards = [];
        try {
          deckCards = JSON.parse(deck.cards);
        } catch {}
        // Find a card in the deck whose name starts with mainName + ' ' (case-insensitive, to avoid partial matches)
        let foundCard = null;
        for (const cardEntry of deckCards) {
          if (!cardEntry.cardId) continue;
          const cardData = cards.find((c) => c.cardId === cardEntry.cardId);
          if (
            cardData &&
            typeof cardData.name === "string" &&
            (cardData.name.toLowerCase().startsWith(mainName.toLowerCase() + " ") ||
              cardData.name.toLowerCase() === mainName.toLowerCase()) // NEW: exact match
          ) {
            foundCard = cardData;
            break;
          }
        }
        // Fallback: if not found, use previous logic (substring match)
        if (!foundCard) {
          for (const cardEntry of deckCards) {
            if (!cardEntry.cardId) continue;
            const cardData = cards.find((c) => c.cardId === cardEntry.cardId);
            if (
              cardData &&
              typeof cardData.name === "string" &&
              cardData.name.toLowerCase().includes(mainName.toLowerCase())
            ) {
              foundCard = cardData;
              break;
            }
          }
        }
        // --- NEW: Fallback, match all words in any order ---
        if (!foundCard) {
          const mainWords = mainName.toLowerCase().split(/\s+/).filter(Boolean);
          for (const cardEntry of deckCards) {
            if (!cardEntry.cardId) continue;
            const cardData = cards.find((c) => c.cardId === cardEntry.cardId);
            if (cardData && typeof cardData.name === "string") {
              const cardNameNorm = cardData.name.toLowerCase().replace(/[^a-z0-9 ]/g, "");
              if (mainWords.every((w) => cardNameNorm.includes(w))) {
                foundCard = cardData;
                break;
              }
            }
          }
        }
        if (foundCard && foundCard.cardId) {
          deck.thumbnail = `${foundCard.cardId}_large.webp`;
          updated = true;
        }
      }
    }
  }
  if (updated) {
    fs.writeFileSync(decksPath, JSON.stringify(decks, null, 2), "utf-8");
    console.log("Auto-assigned thumbnails for qualifying decks in LimitlessDecks.json");
  } else {
    console.log("No qualifying decks found for thumbnail auto-assignment.");
  }
}

// --- AUTO-ASSIGN THUMBNAILS TO DECK LIBRARY MAPPING ---
function autoAssignThumbnailsToDeckLibraryMapping() {
  const cardsPath = path.join(__dirname, "..", "assets", "database", "Card.json");
  const mappingPath = path.join(__dirname, "..", "helpers", "deckLibraryMapping.ts");
  if (!fs.existsSync(cardsPath) || !fs.existsSync(mappingPath)) {
    console.error("Card.json or deckLibraryMapping.ts not found.");
    return;
  }
  const cards = JSON.parse(fs.readFileSync(cardsPath, "utf-8"));
  let mapping = {};
  try {
    const raw = fs.readFileSync(mappingPath, "utf-8");
    const match = raw.match(/const deckLibraryMapping: DeckLibraryMapping = (\{[\s\S]*?\});/);
    if (match) {
      mapping = eval("(" + match[1] + ")");
    }
  } catch {}

  // Define scalable pokemon rules
  const pokemonRules = ["ex"];
  let updated = false;
  for (const variantOf in mapping) {
    if (!mapping[variantOf].thumbnail || mapping[variantOf].thumbnail === "") {
      const words = variantOf.split(/\s+/);
      let searchName = words[0];
      if (words.length > 1 && pokemonRules.includes(words[1].toLowerCase())) {
        searchName = words[0] + " " + words[1];
      }
      // Find all cards with this name (case-insensitive)
      const foundCards = cards.filter(
        (c) => typeof c.name === "string" && c.name.toLowerCase() === searchName.toLowerCase()
      );
      if (foundCards.length > 0) {
        // If more than one, use the second; else use the first
        const cardToUse = foundCards.length > 1 ? foundCards[1] : foundCards[0];
        mapping[variantOf].thumbnail = `${cardToUse.cardId}_large.webp`;
        updated = true;
      }
    }
  }
  if (updated) {
    const out = `// helpers/deckLibraryMapping.ts\n// This file maps each unique variant family (variantOf) from LimitlessDecks to a thumbnail image.\n// Fill in the thumbnail for each variant family manually.\n\nexport interface DeckLibraryMapping {\n  [variantOf: string]: {\n    thumbnail: string; // e.g. 'sv1-1_large.webp' or a custom image path\n  };\n}\n\nconst deckLibraryMapping: DeckLibraryMapping = ${JSON.stringify(
      mapping,
      null,
      2
    )};\n\nexport default deckLibraryMapping;\n`;
    fs.writeFileSync(mappingPath, out, "utf-8");
    console.log("Auto-assigned thumbnails for deckLibraryMapping.");
  }
}

// --- ENERGY CARD NORMALIZATION ---
// Only keep SVE-9 to SVE-16 for basic energy, convert all others by name
function normalizeBasicEnergyCards(cardsArr) {
  // Load the basic energy map
  const energyMap = JSON.parse(fs.readFileSync(path.join(__dirname, "db/basicEnergyMap.json"), "utf-8"));
  // Map from name (lowercase, no 'basic ' prefix) to SVE-# code
  const allowed = ["SVE-9", "SVE-10", "SVE-11", "SVE-12", "SVE-13", "SVE-14", "SVE-15", "SVE-16"];
  // Build a map: key = normalized name, value = SVE-#
  const nameToSVE = {};
  for (const entry of energyMap) {
    if (entry.ptcgoCode && allowed.includes(entry.ptcgoCode.toUpperCase())) {
      // Normalize name: remove 'basic ' prefix, lowercase
      let norm = entry.name
        .toLowerCase()
        .replace(/^basic\s+/, "")
        .trim();
      nameToSVE[norm] = entry.ptcgoCode.toUpperCase();
    }
  }
  // NORMALIZE ENERGY: For each card, if its ptcgoCode is a basic energy but not SVE-9..16, convert
  for (const card of cardsArr) {
    if (typeof card.cardId === "string") {
      const ptcgoCode = card.cardId.toUpperCase();
      // If already allowed, keep
      if (allowed.includes(ptcgoCode)) continue;
      // Try to match by ptcgoCode in energyMap
      const entry = energyMap.find((e) => e.ptcgoCode && e.ptcgoCode.toUpperCase() === ptcgoCode);
      if (entry) {
        // Normalize name: remove 'basic ' prefix, lowercase
        let norm = entry.name
          .toLowerCase()
          .replace(/^basic\s+/, "")
          .trim();
        if (nameToSVE[norm]) {
          const fromVal = card.cardId;
          const toVal = nameToSVE[norm];
          if (fromVal.toUpperCase() !== toVal) {
            console.log(`[ENERGY REPLACE] ${fromVal} => ${toVal}`);
            card.cardId = toVal;
          }
        }
      }
    }
  }
  // Remove duplicates and sum quantities for the same SVE-#
  const deduped = {};
  for (const card of cardsArr) {
    const id = card.cardId.toUpperCase();
    if (!deduped[id]) deduped[id] = { ...card };
    else deduped[id].quantity += card.quantity;
  }
  return Object.values(deduped);
}

// Helper to parse tournament date string like '17th May 2025' to Date object
function parseTournamentDate(dateStr) {
  // Remove ordinal suffixes (st, nd, rd, th)
  const clean = dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
  // Parse with Date
  return new Date(clean);
}

// --- MAIN ---
async function main() {
  // Prepare mapping tables once
  const cardSetPath = path.join(__dirname, "..", "assets", "database", "CardSet.json");
  const cardJsonPath = path.join(__dirname, "..", "assets", "database", "Card.json");
  const cardSets = JSON.parse(fs.readFileSync(cardSetPath, "utf-8"));
  const ptcgoToSetId = {};
  for (const set of cardSets) ptcgoToSetId[set.ptcgoCode] = set.id;
  const cards = JSON.parse(fs.readFileSync(cardJsonPath, "utf-8"));
  const setNumToCardId = {};
  for (const card of cards) setNumToCardId[`${card.setId}-${card.number}`] = card.cardId;

  const listUrl = process.argv[2] || "https://limitlesstcg.com/decks";
  const allDecks = await scrapeAllDeckLinks(listUrl);
  console.log(`Found ${allDecks.length} unique deck links. Scraping...`);
  // Always start with a fresh file
  fs.writeFileSync(path.join(__dirname, "..", "assets", "database", "LimitlessDecks.json"), "[]", "utf-8");
  let idCounter = 1;
  // Collect pending decks for later processing
  const pendingDecks = [];
  // After all parent pages, process pendingDecks with async/await
  for (const { url, variantOf } of allDecks) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      // --- REVISED: Track current tournament date as we iterate rows ---
      let currentTournamentDate = null;
      let currentTournamentText = null;
      $("table.data-table tr").each((i, el) => {
        // Look for a <a> with href starting with '/tournaments/' in this row
        const tourLink = $(el).find("a[href^='/tournaments/']");
        if (tourLink.length > 0) {
          // This is a tournament header row
          const text = tourLink.text();
          // Extract date (assume it's before the dash)
          const match = text.match(/^(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/);
          if (match) {
            currentTournamentDate = parseTournamentDate(match[1]);
            currentTournamentText = text;
          } else {
            currentTournamentDate = null;
            currentTournamentText = null;
          }
        } else {
          // This is a deck row (not a sub-heading)
          // Remove hyphens from each alt name
          const imgAlts = [];
          $(el)
            .find("img.pokemon")
            .each((j, img) => {
              const alt = $(img).attr("alt");
              if (alt) imgAlts.push(alt);
            });
          const name = imgAlts.map((n) => (typeof n === "string" ? n.replace(/-/g, " ") : n));
          const key = `${name}|||${variantOf}`;
          // Find the /decks/list/ link in this row
          const listLink = $(el).find("a[href^='/decks/list/']").attr("href");
          // --- NEW: Extract player name ---
          const playerLink = $(el).find("a[href^='/players/']");
          const player = playerLink.length > 0 ? playerLink.text().trim() : null;
          // --- NEW: Tournament info (full text from last header) ---
          const tournament = currentTournamentText || null;
          // Only add if tournamentDate is valid and >= MIN_TOURNAMENT_DATE
          if (name.length && listLink && currentTournamentDate && currentTournamentDate >= MIN_TOURNAMENT_DATE) {
            pendingDecks.push({
              name,
              variant: variantOf,
              listUrl: "https://limitlesstcg.com" + listLink,
              key,
              tournamentDate: currentTournamentDate,
              tournamentText: currentTournamentText,
              player,
              tournament,
            });
          }
        }
      });
      console.log(`Scraped deck variants from: ${url}`);
    } catch (e) {
      console.error("Failed to scrape", url, e.message);
    }
  }
  // After all parent pages, process pendingDecks with async/await
  for (const deck of pendingDecks) {
    try {
      const { data: listData } = await axios.get(deck.listUrl);
      const $$ = cheerio.load(listData);
      let cards = [];
      // Get deck name from .decklist-title (text only, strip children)
      let decklistTitle = $$(".decklist-title").clone().children().remove().end().text().trim();
      if (!decklistTitle) decklistTitle = deck.name; // fallback
      $$(".decklist-cards .decklist-card").each((k, cardEl) => {
        const dataSet = $$(cardEl).attr("data-set");
        const dataNumber = $$(cardEl).attr("data-number");
        const qty = parseInt($$(cardEl).find(".card-count").text().trim(), 10) || 1;
        if (dataSet && dataNumber) {
          cards.push({ cardId: `${dataSet}-${dataNumber}`, quantity: qty });
        }
      });
      // Map cardIds before saving
      cards = mapCardIdsForCardsArray(cards, ptcgoToSetId, setNumToCardId);
      // Normalize basic energy cards
      cards = normalizeBasicEnergyCards(cards);
      saveDeckToJson(
        {
          name: deck.name,
          variant: deck.variant,
          cards: JSON.stringify(cards),
          thumbnail: "",
          player: deck.player,
          tournament: deck.tournament,
        },
        path.join("..", "assets", "database", "LimitlessDecks.json"),
        false // Always append, never reset
      );
    } catch (err) {
      console.error("Failed to fetch decklist for", deck.listUrl, err.message);
    }
  }
  console.log("Batch scraping complete.");
  // Update deck library mapping after JSON is created
  const mappingPath = path.join(__dirname, "..", "helpers", "deckLibraryMapping.ts");
  const jsonPath = path.join(__dirname, "..", "assets", "database", "LimitlessDecks.json");
  updateDeckLibraryMappingFromJson(jsonPath, mappingPath);
  // Auto-assign thumbnails after all decks are written
  autoAssignThumbnailsToDecks();
  // Auto-assign thumbnails for deck library mapping
  autoAssignThumbnailsToDeckLibraryMapping();
}

if (require.main === module) {
  main();
}

// Exports for testing
module.exports = { scrapeLimitlessDeck, saveDeckToJson };
