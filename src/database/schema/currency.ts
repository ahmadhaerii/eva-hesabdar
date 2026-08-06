import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/* ==========================================================
   CURRENCIES
========================================================== */

export const currencies = sqliteTable(
  "currencies",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    code: text("code").notNull(),

    name: text("name").notNull(),

    symbol: text("symbol"),

    isBase: integer("is_base", { mode: "boolean" }).notNull().default(false),

    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),

    deletedAt: text("deleted_at"),
  },
  (table) => ({
    codeUnique: uniqueIndex("uq_currencies_code").on(table.code),

    nameUnique: uniqueIndex("uq_currencies_name").on(table.name),

    codeIndex: index("idx_currencies_code").on(table.code),

    activeIndex: index("idx_currencies_active").on(table.isActive),
  }),
);

/* ==========================================================
   CURRENCY RATES
========================================================== */

export const currencyRates = sqliteTable(
  "currency_rates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    currencyId: integer("currency_id")
      .notNull()
      .references(() => currencies.id),

    rate: real("rate").notNull(),

    effectiveAt: text("effective_at").notNull(),

    description: text("description"),

    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    currencyIndex: index("idx_currency_rates_currency").on(table.currencyId),

    effectiveIndex: index("idx_currency_rates_effective").on(table.effectiveAt),

    lookupIndex: index("idx_currency_rates_lookup").on(
      table.currencyId,
      table.id,
    ),
  }),
);
