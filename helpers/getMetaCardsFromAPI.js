import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import fs from "fs";
import path from "path";
import https from "https";
import sharp from "sharp";

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

    // Directories for PNG downloads and WebP outputs
    const downloadCardImageDir = path.resolve(process.cwd(), "public/downloads/card-images");
    const downloadSetImageDir = path.resolve(process.cwd(), "public/downloads/set-images");
    const webpCardImageDir = path.resolve(process.cwd(), "public/card-images");
    const webpSetImageDir = path.resolve(process.cwd(), "public/set-images");

    // Ensure all directories exist
    [downloadCardImageDir, downloadSetImageDir, webpCardImageDir, webpSetImageDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

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

    const downloadedSetImages = new Set();

    function getFilenameFromUrl(url) {
      return url.split("/").pop();
    }

    for (const card of allCards) {
      if (card.images && card.images.small) {
        const ext = path.extname(card.images.small) || ".png";
        const pngSmall = `${card.id}_small${ext}`;
        const pngSmallAbs = path.resolve(downloadCardImageDir, pngSmall);
        const webpSmall = `${card.id}_small.webp`;
        const webpSmallAbs = path.resolve(webpCardImageDir, webpSmall);
        if (!fs.existsSync(pngSmallAbs)) {
          try {
            await downloadImage(card.images.small, pngSmallAbs);
            await sharp(pngSmallAbs).webp({ quality: 60 }).toFile(webpSmallAbs);
            card.images.small = `/card-images/${webpSmall}`;
          } catch (e) {
            console.warn(`Failed to download/convert small image for ${card.id}`);
            console.warn(e);
          }
        } else if (!fs.existsSync(webpSmallAbs)) {
          await sharp(pngSmallAbs).webp({ quality: 60 }).toFile(webpSmallAbs);
          card.images.small = `/card-images/${webpSmall}`;
        } else {
          card.images.small = `/card-images/${webpSmall}`;
        }
      }
      if (card.images && card.images.large) {
        const ext = path.extname(card.images.large) || ".png";
        const pngLarge = `${card.id}_large${ext}`;
        const pngLargeAbs = path.resolve(downloadCardImageDir, pngLarge);
        const webpLarge = `${card.id}_large.webp`;
        const webpLargeAbs = path.resolve(webpCardImageDir, webpLarge);
        if (!fs.existsSync(pngLargeAbs)) {
          try {
            await downloadImage(card.images.large, pngLargeAbs);
            await sharp(pngLargeAbs).webp({ quality: 60 }).toFile(webpLargeAbs);
            card.images.large = `/card-images/${webpLarge}`;
          } catch (e) {
            console.warn(`Failed to download/convert large image for ${card.id}`);
            console.warn(e);
          }
        } else if (!fs.existsSync(webpLargeAbs)) {
          await sharp(pngLargeAbs).webp({ quality: 60 }).toFile(webpLargeAbs);
          card.images.large = `/card-images/${webpLarge}`;
        } else {
          card.images.large = `/card-images/${webpLarge}`;
        }
      }
      // Download set symbol and logo if present
      if (card.set && card.set.images) {
        for (const key of ["symbol", "logo"]) {
          const url = card.set.images[key];
          if (url) {
            const filename = getFilenameFromUrl(url);
            const pngSet = filename;
            const pngSetAbs = path.resolve(downloadSetImageDir, pngSet);
            const webpSet = `${path.parse(filename).name}.webp`;
            const webpSetAbs = path.resolve(webpSetImageDir, webpSet);
            if (!downloadedSetImages.has(filename) && !fs.existsSync(pngSetAbs)) {
              try {
                await downloadImage(url, pngSetAbs);
                downloadedSetImages.add(filename);
                await sharp(pngSetAbs).webp({ quality: 60 }).toFile(webpSetAbs);
                card.set.images[key] = `/set-images/${webpSet}`;
              } catch (e) {
                console.warn(`Failed to download/convert set ${key} for ${card.set.id}`);
                console.warn(e);
              }
            } else if (!fs.existsSync(webpSetAbs)) {
              await sharp(pngSetAbs).webp({ quality: 60 }).toFile(webpSetAbs);
              card.set.images[key] = `/set-images/${webpSet}`;
            } else {
              card.set.images[key] = `/set-images/${webpSet}`;
            }
          }
        }
      }
    }

    // Write all the filtered cards to a file (with local image paths)
    fs.writeFileSync("db/metaCards.json", JSON.stringify(allCards, null, 2));
    console.log("Filtered cards and images saved to metaCards.json and public/card-images/");
  } catch (error) {
    console.error("Error fetching or saving cards:", error);
  }
}

getMetaCardsFromAPI();
