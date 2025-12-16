import { sqliteTable, text, real, integer, index, unique } from "drizzle-orm/sqlite-core";

export const rates = sqliteTable(
  "rates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(), // YYYY-MM-DD format
    currencyCode: text("currency_code").notNull(),
    country: text("country").notNull(),
    currencyName: text("currency_name").notNull(),
    amount: integer("amount").notNull(), // units per rate (e.g., 100 for JPY)
    rate: real("rate").notNull(), // CZK value
  },
  (table) => [
    index("idx_date").on(table.date),
    index("idx_currency_code").on(table.currencyCode),
    index("idx_date_currency").on(table.date, table.currencyCode),
    unique("unique_date_currency").on(table.date, table.currencyCode),
  ]
);

export type Rate = typeof rates.$inferSelect;
export type NewRate = typeof rates.$inferInsert;
