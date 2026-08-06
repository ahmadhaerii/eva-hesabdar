import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { currencies, currencyRates } from "./currency";

/* ==========================================================
   CURRENCY CONVERSIONS
========================================================== */

export const currencyConversions = sqliteTable(
  "currency_conversions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    conversionNumber: text("conversion_number").notNull(),

    conversionDate: text("conversion_date").notNull(),

    fromCurrencyId: integer("from_currency_id")
      .notNull()
      .references(() => currencies.id),

    toCurrencyId: integer("to_currency_id")
      .notNull()
      .references(() => currencies.id),

    sourceAmount: real("source_amount").notNull(),

    expectedRateId: integer("expected_rate_id")
      .notNull()
      .references(() => currencyRates.id),

    expectedRate: real("expected_rate").notNull(),

    expectedDestinationAmount: real("expected_destination_amount").notNull(),

    actualDestinationAmount: real("actual_destination_amount").notNull(),

    differenceAmount: real("difference_amount").notNull(),

    description: text("description"),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),
  },
  (table) => ({
    conversionUnique: uniqueIndex("uq_currency_conversion_number").on(
      table.conversionNumber,
    ),

    dateIndex: index("idx_currency_conversion_date").on(table.conversionDate),

    fromCurrencyIndex: index("idx_currency_conversion_from").on(
      table.fromCurrencyId,
    ),

    toCurrencyIndex: index("idx_currency_conversion_to").on(table.toCurrencyId),
  }),
);

/* ==========================================================
   SETTINGS
========================================================== */

export const settings = sqliteTable(
  "settings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    settingKey: text("setting_key").notNull(),

    settingValue: text("setting_value"),

    description: text("description"),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),
  },
  (table) => ({
    keyUnique: uniqueIndex("uq_settings_key").on(table.settingKey),

    keyIndex: index("idx_settings_key").on(table.settingKey),
  }),
);
