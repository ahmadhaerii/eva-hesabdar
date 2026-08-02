// src/database/schema/units.ts
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const units = sqliteTable(
  "units",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    description: text("description"),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    uniqueIndex("uq_units_name").on(table.name),
    uniqueIndex("uq_units_symbol").on(table.symbol),
    index("idx_units_active").on(table.isActive),
    index("idx_units_deleted").on(table.deletedAt),
  ],
);
