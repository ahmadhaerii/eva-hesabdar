// src/database/schema/currency-rates.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { currencies } from "./currencies";

export const currencyRates = sqliteTable(
  "currency_rates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    currencyId: integer("currency_id")
      .notNull()
      .references(() => currencies.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    rate: real("rate").notNull(),
    effectiveAt: text("effective_at").notNull(),
    description: text("description"),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index("idx_currency_rates_currency").on(table.currencyId),
    index("idx_currency_rates_active").on(table.isActive),
    index("idx_currency_rates_effective").on(table.effectiveAt),
    check("ck_currency_rates_rate", sql`${table.rate} > 0`),
  ],
);
