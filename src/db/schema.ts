import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch())`;

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  nameFa: text("name_fa").notNull(),
  nameEn: text("name_en").notNull(),
  /** e.g. "60x60" (cm) */
  size: text("size").notNull(),
  glaze: text("glaze", { enum: ["polish", "matte"] }).notNull(),
  series: text("series").notNull().default(""),
  descFa: text("desc_fa").notNull().default(""),
  descEn: text("desc_en").notNull().default(""),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().default(now),
  updatedAt: integer("updated_at").notNull().default(now),
});

/** Different faces (designs) of a product; first by sortOrder is the cover. */
export const productImages = sqliteTable("product_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  file: text("file").notNull(), // 32-hex id; variants are <id>-480|960|1600.webp
  sortOrder: integer("sort_order").notNull().default(0),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titleFa: text("title_fa").notNull(),
  titleEn: text("title_en").notNull(),
  createdAt: integer("created_at").notNull().default(now),
});

export const projectImages = sqliteTable("project_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  file: text("file").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Which products were used in which project. */
export const productProjects = sqliteTable(
  "product_projects",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.projectId] })],
);

export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
