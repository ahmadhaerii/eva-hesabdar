// src/database/schema/products.ts
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories";
import { units } from "./units";

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
    unitId: integer("unit_id")
      .notNull()
      .references(() => units.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    description: text("description"),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    uniqueIndex("uq_products_code").on(table.code),
    index("idx_products_name").on(table.name),
    index("idx_products_category").on(table.categoryId),
    index("idx_products_unit").on(table.unitId),
    index("idx_products_active").on(table.isActive),
    index("idx_products_deleted").on(table.deletedAt),
  ],
);
