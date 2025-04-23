import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imagesDir = path.resolve(__dirname, "../assets/card-images");
const outputFile = path.resolve(__dirname, "../db/cardImages.ts");

const files = fs.readdirSync(imagesDir).filter((f) => f.endsWith("_small.webp") || f.endsWith("_large.webp"));

let mapping = "const cardImages: Record<string, any> = {\n";

files.forEach((filename) => {
  mapping += `  '${filename}': require('../assets/card-images/${filename}'),\n`;
});

mapping += "};\n\nexport default cardImages;\n";

fs.writeFileSync(outputFile, mapping);

console.log(`cardImages.ts generated with ${files.length} images.`);
