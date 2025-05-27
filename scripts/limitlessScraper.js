// limitlessScraper.js
// Script to scrape LimitlessTCG deck data and build a SQLite DB for limitlessDecks
// Usage: node limitlessScraper.js <url> (or modify for batch)

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// --- DB SETUP ---
const DB_PATH = path.join(__dirname, "db", "limitlessDecks.db");
const SCHEMA_PATH = path.join(__dirname, "db", "limitlessSchema.sql");

function ensureDbAndSchema() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const db = new Database(DB_PATH);
    const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
    db.exec(schema);
    db.close();
  }
}

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

  // Remove player from returned object
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
      // Get variantOf from the parent link text (excluding annotation span)
      let variantOf = a.clone().children("span").remove().end().text().trim();
      // Find all img alts in the row for deck name
      const imgAlts = [];
      $(el)
        .find("img.pokemon")
        .each((j, img) => {
          const alt = $(img).attr("alt");
          if (alt) imgAlts.push(alt);
        });
      const name = imgAlts.join(" / ");
      if (href && name && variantOf) {
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
  for (let page = 1; page <= maxPage; page++) {
    let url = baseUrl + (page > 1 ? `?page=${page}` : "");
    const decks = await scrapeDecksFromListPage(url);
    allDecks = allDecks.concat(decks);
    console.log(`Found ${decks.length} decks on page ${page}/${maxPage}`);
  }
  // Remove duplicates by name+variantOf
  const unique = {};
  for (const d of allDecks) {
    const key = `${d.name}|||${d.variantOf}`;
    if (!unique[key]) unique[key] = d;
  }
  return Object.values(unique);
}

// --- DB INSERT ---
function saveDeckToJson(deck, outPath = "db/LimitlessDecks.json", reset = false) {
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
    name: deck.name || "",
    variantOf: deck.variant || null,
    cards: deck.cards || "[]",
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

// --- MAIN ---
async function main() {
  ensureDbAndSchema();
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
  fs.writeFileSync(path.join(__dirname, "db", "LimitlessDecks.json"), "[]", "utf-8");
  let idCounter = 1;
  const globalSeen = new Set(); // Track unique name+variantOf globally
  // Collect pending decks for later processing
  const pendingDecks = [];
  for (const { url, variantOf } of allDecks) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      $("table.data-table tr").each((i, el) => {
        const imgAlts = [];
        $(el)
          .find("img.pokemon")
          .each((j, img) => {
            const alt = $(img).attr("alt");
            if (alt) imgAlts.push(alt);
          });
        const name = imgAlts.join(" / ");
        const key = `${name}|||${variantOf}`;
        // Find the /decks/list/ link in this row
        const listLink = $(el).find("a[href^='/decks/list/']").attr("href");
        if (name && !globalSeen.has(key) && listLink) {
          pendingDecks.push({
            name,
            variant: variantOf,
            listUrl: "https://limitlesstcg.com" + listLink,
            key,
          });
        }
      });
      console.log(`Scraped deck variants from: ${url}`);
    } catch (e) {
      console.error("Failed to scrape", url, e.message);
    }
  }
  // After all parent pages, process pendingDecks with async/await
  for (const deck of pendingDecks) {
    if (!globalSeen.has(deck.key)) {
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
        saveDeckToJson(
          { name: decklistTitle, variant: deck.variant, cards: JSON.stringify(cards) },
          "db/LimitlessDecks.json",
          globalSeen.size === 0
        );
        globalSeen.add(deck.key);
      } catch (err) {
        console.error("Failed to fetch decklist for", deck.listUrl, err.message);
      }
    }
  }
  console.log("Batch scraping complete.");
}

if (require.main === module) {
  main();
}

// Exports for testing
module.exports = { scrapeLimitlessDeck, /*insertDeck,*/ ensureDbAndSchema, saveDeckToJson };
