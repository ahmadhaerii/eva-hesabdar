// src/database/schema/settings.ts
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const settings = sqliteTable(
  "settings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").notNull(),
    value: text("value"),
    description: text("description"),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("uq_settings_key").on(table.key)],
);
