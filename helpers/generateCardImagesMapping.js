const fs = require("fs");
const path = require("path");

const imagesDir = path.join(__dirname, "../assets/images/card-images");
const outputFile = path.join(__dirname, "./cardImages.ts");

const files = fs.readdirSync(imagesDir).filter((f) => f.endsWith("_small.webp") || f.endsWith("_large.webp"));

let mapping = "const cardImages: Record<string, any> = {\n";

files.forEach((filename) => {
  mapping += `  '${filename}': require('../assets/images/card-images/${filename}'),\n`;
});

mapping += "};\n\nexport default cardImages;\n";

fs.writeFileSync(outputFile, mapping);

console.log(`cardImages.ts generated with ${files.length} images.`);
