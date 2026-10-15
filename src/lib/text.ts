/** Normalises Persian/Arabic text so search ignores ي/ی, ك/ک, digit styles, ZWNJ, diacritics. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/ۀ/g, "ه").replace(/ة/g, "ه")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x6f0))
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[\u200c\u200d×*]/g, (c) => (c === "×" || c === "*" ? "x" : " "))
    .replace(/\s+/g, " ")
    .trim();
}

export const sizeLabel = (size: string) => size.replace("x", "×");
