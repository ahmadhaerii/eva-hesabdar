// src/database/schema/currency-conversions.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { currencies } from "./currencies";
import { currencyRates } from "./currency-rates";

export const currencyConversions = sqliteTable(
  "currency_conversions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    conversionNumber: text("conversion_number").notNull(),
    fromCurrencyId: integer("from_currency_id")
      .notNull()
      .references(() => currencies.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    toCurrencyId: integer("to_currency_id")
      .notNull()
      .references(() => currencies.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    fromAmount: real("from_amount").notNull(),
    expectedRateId: integer("expected_rate_id")
      .notNull()
      .references(() => currencyRates.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    expectedRate: real("expected_rate").notNull(),
    expectedToAmount: real("expected_to_amount").notNull(),
    actualToAmount: real("actual_to_amount").notNull(),
    differenceAmount: real("difference_amount").notNull(),
    conversionDate: text("conversion_date").notNull(),
    description: text("description"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("uq_conversion_number").on(table.conversionNumber),
    index("idx_conversion_date").on(table.conversionDate),
    index("idx_conversion_from").on(table.fromCurrencyId),
    index("idx_conversion_to").on(table.toCurrencyId),
  ],
);
