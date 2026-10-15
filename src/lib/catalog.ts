import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { imageUrl } from "@/lib/images";
import type { Lang } from "@/i18n";
import { normalizeText } from "@/lib/text";

export type CatalogProduct = {
  id: number; slug: string; nameFa: string; nameEn: string; size: string;
  glaze: "polish" | "matte"; series: string; descFa: string; descEn: string;
  available: boolean; images: string[]; updatedAt: number;
};

/** Lightweight, already-localised shape sent to client components. */
export type ListItem = {
  id: number; slug: string; name: string; size: string; glaze: "polish" | "matte";
  series: string; available: boolean; cover: string | null; cover2: string | null; search: string;
};

export function listProducts(): CatalogProduct[] {
  const db = getDb();
  const rows = db.select().from(schema.products).orderBy(desc(schema.products.id)).all();
  const imgs = db.select().from(schema.productImages)
    .orderBy(asc(schema.productImages.sortOrder), asc(schema.productImages.id)).all();
  const map = new Map<number, string[]>();
  for (const i of imgs) map.set(i.productId, [...(map.get(i.productId) ?? []), i.file]);
  return rows.map((p) => ({ ...p, images: map.get(p.id) ?? [] }));
}

export function getProductBySlug(slug: string): CatalogProduct | null {
  const db = getDb();
  const p = db.select().from(schema.products).where(eq(schema.products.slug, slug)).get();
  if (!p) return null;
  const images = db.select().from(schema.productImages).where(eq(schema.productImages.productId, p.id))
    .orderBy(asc(schema.productImages.sortOrder), asc(schema.productImages.id)).all().map((i) => i.file);
  return { ...p, images };
}

export function toListItem(p: CatalogProduct, lang: Lang): ListItem {
  return {
    id: p.id, slug: p.slug, name: lang === "fa" ? p.nameFa : p.nameEn, size: p.size, glaze: p.glaze,
    series: p.series, available: p.available,
    cover: p.images[0] ? imageUrl(p.images[0], 960) : null,
    cover2: p.images[1] ? imageUrl(p.images[1], 960) : null,
    search: normalizeText(`${p.nameFa} ${p.nameEn} ${p.series} ${p.size} ${p.glaze === "polish" ? "پولیش polished polish" : "مات matte"}`),
  };
}

export type ProjectView = { id: number; title: string; images: string[] };

function projectsFrom(rows: { id: number; titleFa: string; titleEn: string }[], lang: Lang): ProjectView[] {
  const db = getDb();
  const imgs = db.select().from(schema.projectImages)
    .orderBy(asc(schema.projectImages.sortOrder), asc(schema.projectImages.id)).all();
  return rows
    .map((r) => ({
      id: r.id, title: lang === "fa" ? r.titleFa : r.titleEn,
      images: imgs.filter((i) => i.projectId === r.id).map((i) => i.file),
    }))
    .filter((p) => p.images.length > 0);
}

export function listProjects(lang: Lang, limit = 5): ProjectView[] {
  const rows = getDb().select().from(schema.projects).orderBy(desc(schema.projects.id)).all();
  return projectsFrom(rows, lang).slice(0, limit);
}

export function projectsForProduct(productId: number, lang: Lang): ProjectView[] {
  const db = getDb();
  const rows = db.select({ id: schema.projects.id, titleFa: schema.projects.titleFa, titleEn: schema.projects.titleEn })
    .from(schema.productProjects)
    .innerJoin(schema.projects, eq(schema.projects.id, schema.productProjects.projectId))
    .where(eq(schema.productProjects.productId, productId)).all();
  return projectsFrom(rows, lang);
}
