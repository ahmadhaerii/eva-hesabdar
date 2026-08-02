// src/database/schema/inventory-transactions.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { products } from "./products";
import { inventoryLots } from "./inventory-lots";

export const inventoryTransactions = sqliteTable(
  "inventory_transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    lotId: integer("lot_id").references(() => inventoryLots.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
    transactionType: text("transaction_type").notNull(),
    quantity: real("quantity").notNull(),
    referenceTable: text("reference_table"),
    referenceId: integer("reference_id"),
    transactionDate: text("transaction_date").notNull(),
    description: text("description"),
  },
  (table) => [
    index("idx_inventory_tx_product").on(table.productId),
    index("idx_inventory_tx_lot").on(table.lotId),
    index("idx_inventory_tx_date").on(table.transactionDate),
  ],
);
