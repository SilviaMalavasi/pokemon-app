import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import fs from "fs";
import path from "path";
import https from "https";

const API_URL = process.env.POKEMON_API_URL;
const API_KEY = process.env.POKEMON_API_KEY;

async function getMetaCardsFromAPI() {
  try {
    console.log("Fetching Pokémon cards...");

    let allCards = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`Fetching page ${page}...`);

      // Fetch cards with regulationMark G or H for the current page
      const response = await axios.get(`${API_URL}cards`, {
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

    // Download images and update card image paths
    const imageDir = path.resolve(process.cwd(), "public/card-images");
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    async function downloadImage(url, dest) {
      return new Promise((resolve, reject) => {
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
    }

    const setImageDir = path.resolve(imageDir, "sets");
    if (!fs.existsSync(setImageDir)) {
      fs.mkdirSync(setImageDir, { recursive: true });
    }
    const downloadedSetImages = new Set();

    function getFilenameFromUrl(url) {
      return url.split("/").pop();
    }

    for (const card of allCards) {
      if (card.images && card.images.small) {
        const ext = path.extname(card.images.small) || ".png";
        const localSmall = `card-images/${card.id}_small${ext}`;
        const localSmallAbs = path.resolve(imageDir, `${card.id}_small${ext}`);
        if (!fs.existsSync(localSmallAbs)) {
          try {
            await downloadImage(card.images.small, localSmallAbs);
            card.images.small = `/${localSmall}`;
          } catch (e) {
            console.warn(`Failed to download small image for ${card.id}`);
            console.warn(e);
          }
        } else {
          card.images.small = `/${localSmall}`;
        }
      }
      if (card.images && card.images.large) {
        const ext = path.extname(card.images.large) || ".png";
        const localLarge = `card-images/${card.id}_large${ext}`;
        const localLargeAbs = path.resolve(imageDir, `${card.id}_large${ext}`);
        if (!fs.existsSync(localLargeAbs)) {
          try {
            await downloadImage(card.images.large, localLargeAbs);
            card.images.large = `/${localLarge}`;
          } catch (e) {
            console.warn(`Failed to download large image for ${card.id}`);
            console.warn(e);
          }
        } else {
          card.images.large = `/${localLarge}`;
        }
      }
      // Download set symbol and logo if present
      if (card.set && card.set.images) {
        for (const key of ["symbol", "logo"]) {
          const url = card.set.images[key];
          if (url) {
            const filename = getFilenameFromUrl(url);
            const localPath = `sets-images/${filename}`;
            const localAbs = path.resolve(setImageDir, filename);
            if (!downloadedSetImages.has(filename) && !fs.existsSync(localAbs)) {
              try {
                await downloadImage(url, localAbs);
                downloadedSetImages.add(filename);
              } catch (e) {
                console.warn(`Failed to download set ${key} for ${card.set.id}`);
                console.warn(e);
              }
            }
            // Update the card's set.images[key] to local path
            card.set.images[key] = `/${localPath}`;
          }
        }
      }
    }

    // Write all the filtered cards to a file (with local image paths)
    fs.writeFileSync("metaCards.json", JSON.stringify(allCards, null, 2));
    console.log("Filtered cards and images saved to metaCards.json and public/card-images/");
  } catch (error) {
    console.error("Error fetching or saving cards:", error);
  }
}

getMetaCardsFromAPI();
