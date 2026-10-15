import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? "./data");

type Db = BetterSQLite3Database<typeof schema>;
const g = globalThis as unknown as { __db?: Db };

/** Lazy singleton: opens the SQLite file and applies pending migrations once. */
export function getDb(): Db {
  if (!g.__db) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const sqlite = new Database(path.join(/*turbopackIgnore: true*/ DATA_DIR, "soheil.db"));
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("busy_timeout = 5000");
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder: path.resolve(/*turbopackIgnore: true*/ "./drizzle") });
    g.__db = db;
  }
  return g.__db;
}

export { schema };
