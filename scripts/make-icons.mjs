// Generates PWA/favicon icons from public/logo.png (transparent PNG).  Usage: npm run icons
import fs from "node:fs";
import sharp from "sharp";

const src = "public/logo.png";
fs.mkdirSync("public/icons", { recursive: true });
const plain = (size, pad = 0.06) => sharp(src).resize({ width: Math.round(size * (1 - 2 * pad)), height: Math.round(size * (1 - 2 * pad)), fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: Math.round(size * pad), bottom: Math.round(size * pad), left: Math.round(size * pad), right: Math.round(size * pad), background: { r: 0, g: 0, b: 0, alpha: 0 } });
const onWhite = (size, pad) => plain(size, pad).flatten({ background: "#ffffff" });

await plain(192).png().toFile("public/icons/icon-192.png");
await plain(512).png().toFile("public/icons/icon-512.png");
await onWhite(512, 0.18).png().toFile("public/icons/maskable-512.png"); // safe zone for maskable icons
await onWhite(180, 0.08).png().toFile("src/app/apple-icon.png");
await plain(256, 0.04).png().toFile("src/app/icon.png");
console.log("icons generated from", src);
