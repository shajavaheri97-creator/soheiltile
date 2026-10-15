import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { DATA_DIR } from "@/db";
import { IMAGE_WIDTHS } from "@/lib/image-url";

export { IMAGE_WIDTHS, imageUrl } from "@/lib/image-url";

sharp.concurrency(1); // keep memory low on a small VPS
sharp.cache(false);

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp"]);

const dirFor = (kind: "products" | "projects") => path.join(/*turbopackIgnore: true*/ DATA_DIR, "uploads", kind);

/** Validates by decoding (not by extension/MIME), re-encodes to WebP in 3 sizes. */
export async function saveImage(file: File, kind: "products" | "projects" = "products") {
  if (file.size === 0) throw new Error("فایل خالی است");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("حجم هر عکس باید کمتر از ۱۲ مگابایت باشد");
  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input, { limitInputPixels: 80_000_000 })
    .metadata()
    .catch(() => null);
  if (!meta?.format || !ALLOWED.has(meta.format)) {
    throw new Error("فقط عکس JPG، PNG یا WebP مجاز است");
  }
  const id = randomBytes(16).toString("hex");
  const dir = dirFor(kind);
  await fs.mkdir(dir, { recursive: true });
  for (const w of IMAGE_WIDTHS) {
    await sharp(input, { limitInputPixels: 80_000_000 })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(dir, `${id}-${w}.webp`));
  }
  return id;
}

export async function deleteImage(id: string, kind: "products" | "projects" = "products") {
  if (!/^[a-f0-9]{32}$/.test(id)) return;
  await Promise.all(
    IMAGE_WIDTHS.map((w) =>
      fs.rm(path.join(/*turbopackIgnore: true*/ dirFor(kind), `${id}-${w}.webp`), { force: true }),
    ),
  );
}

