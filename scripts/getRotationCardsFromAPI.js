// Convert to CommonJS (CJS) syntax
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

const API_URL = "https://api.pokemontcg.io/v2/";
const API_KEY = ""; // Add your API key here

const rootDir = path.resolve(__dirname, "..");

async function getrotationCardsFromAPI() {
  try {
    console.log("Fetching Pokémon cards...");

    let allCards = [];
    let page = 1;
    let hasMore = true;

    // --- First query: regulationMark G, H and I ---
    while (hasMore) {
      console.log(`Fetching page ${page}...`);

      const response = await axios.get(`${API_URL}cards`, {
        headers: {
          "X-Api-Key": API_KEY,
        },
        params: {
          q: 'regulationMark:"G" OR regulationMark:"H" OR regulationMark:"I"',
          pageSize: 250,
          page,
        },
      });

      const cards = response.data.data;
      allCards = allCards.concat(cards);

      // Check if there are more pages
      hasMore = cards.length === 250;
      page++;
    }

    // --- Second query: fetch specific cards by ID (sve-9 to sve-16) ---
    const specificCardIds = ["sve-9", "sve-10", "sve-11", "sve-12", "sve-13", "sve-14", "sve-15", "sve-16"];
    let specificCards = [];
    for (const cardId of specificCardIds) {
      try {
        const response = await axios.get(`${API_URL}cards/${cardId}`, {
          headers: {
            "X-Api-Key": API_KEY,
          },
        });
        if (response.data && response.data.data) {
          specificCards.push(response.data.data);
        }
      } catch {
        console.warn(`Failed to fetch card with ID ${cardId}`);
      }
    }

    // Remove all cards with the same name as those in specificCards from allCards
    const specificCardNames = specificCards.map((card) => card.name);
    const removedCards = allCards.filter((card) => specificCardNames.includes(card.name));
    removedCards.forEach((card) => {
      console.log(`Removed card: Name = ${card.name}, ID = ${card.id}`);
    });
    allCards = allCards.filter((card) => !specificCardNames.includes(card.name));

    // Merge specificCards into allCards
    allCards = allCards.concat(specificCards);

    console.log(`Found ${allCards.length - specificCards.length} cards in rotation.`);
    console.log(`Found ${specificCards.length} basic energy cards.`);

    // Directories for PNG downloads and WebP outputs
    const downloadCardImageDir = path.resolve(rootDir, "db/downloads/card-images");
    const webpCardImageDir = path.resolve(rootDir, "assets/card-images");

    // Ensure all directories exist
    [downloadCardImageDir, webpCardImageDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    async function downloadImage(url, dest, maxRetries = 10) {
      let attempt = 0;
      while (attempt < maxRetries) {
        try {
          return await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(dest);
            https
              .get(url, (response) => {
                if (response.statusCode !== 200) {
                  file.close();
                  fs.unlinkSync(dest);
                  return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                }
                response.pipe(file);
                file.on("finish", () => file.close(resolve));
              })
              .on("error", (err) => {
                file.close();
                fs.unlinkSync(dest);
                reject(err);
              });
          });
        } catch (err) {
          attempt++;
          if (attempt >= maxRetries) {
            throw new Error(`Failed to download image from ${url} after ${maxRetries} attempts. Last error: ${err}`);
          }
          // Wait a bit before retrying
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }

    // Download and convert images to WebP format
    for (const card of allCards) {
      // Only process large images
      if (card.images && card.images.large) {
        const ext = path.extname(card.images.large) || ".png";
        const pngLarge = `${card.id}_large${ext}`;
        const pngLargeAbs = path.resolve(downloadCardImageDir, pngLarge);
        const webpLarge = `${card.id}_large.webp`;
        const webpLargeAbs = path.resolve(webpCardImageDir, webpLarge);
        // If WebP already exists, skip download and conversion
        if (fs.existsSync(webpLargeAbs)) {
          card.images.large = `/card-images/${webpLarge}`;
        } else {
          if (!fs.existsSync(pngLargeAbs)) {
            try {
              await downloadImage(card.images.large, pngLargeAbs);
              await sharp(pngLargeAbs).resize({ width: 400 }).webp({ quality: 60, effort: 6 }).toFile(webpLargeAbs);
              card.images.large = `/card-images/${webpLarge}`;
            } catch (e) {
              console.warn(`Failed to download/convert large image for ${card.id}`);
              console.warn(e);
            }
          } else {
            await sharp(pngLargeAbs).resize({ width: 400 }).webp({ quality: 60, effort: 6 }).toFile(webpLargeAbs);
            card.images.large = `/card-images/${webpLarge}`;
          }
        }
      }
      // Remove small image reference
      if (card.images && card.images.small) {
        delete card.images.small;
      }
    }

    // Write all the filtered cards to a file (with local image paths)
    fs.writeFileSync(path.resolve(rootDir, "db/rotationCards.json"), JSON.stringify(allCards, null, 2));
    console.log("Filtered cards and images saved to rotationCards.json and assets/card-images/");
  } catch (error) {
    console.error("Error fetching or saving cards:", error);
  }
}

getrotationCardsFromAPI();
