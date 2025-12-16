import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const dbPath = process.env.DATABASE_URL || "./data/currencyfisher.db";

// Ensure data directory exists
const dir = dirname(dbPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.exec("PRAGMA journal_mode = WAL;");

export const db = drizzle(sqlite, { schema });

// Create tables from Drizzle schema if they don't exist
// Note: For production, use `drizzle-kit push:sqlite` or migrations
db.run(sql`
  CREATE TABLE IF NOT EXISTS rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    currency_code TEXT NOT NULL,
    country TEXT NOT NULL,
    currency_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    rate REAL NOT NULL,
    UNIQUE(date, currency_code)
  )
`);
db.run(sql`CREATE INDEX IF NOT EXISTS idx_date ON rates(date)`);
db.run(sql`CREATE INDEX IF NOT EXISTS idx_currency_code ON rates(currency_code)`);
db.run(sql`CREATE INDEX IF NOT EXISTS idx_date_currency ON rates(date, currency_code)`);

export { schema };
