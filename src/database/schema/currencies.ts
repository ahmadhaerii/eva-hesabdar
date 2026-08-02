// src/database/schema/currencies.ts
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const currencies = sqliteTable(
  "currencies",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    symbol: text("symbol"),
    isBase: integer("is_base").notNull().default(0),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    uniqueIndex("uq_currencies_code").on(table.code),
    index("idx_currencies_active").on(table.isActive),
    index("idx_currencies_deleted").on(table.deletedAt),
  ],
);
