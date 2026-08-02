// src/database/schema/inventory-lots.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { purchaseInvoiceItems } from "./purchase-invoice-items";
import { products } from "./products";
import { currencies } from "./currencies";

export const inventoryLots = sqliteTable(
  "inventory_lots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    purchaseInvoiceItemId: integer("purchase_invoice_item_id")
      .notNull()
      .references(() => purchaseInvoiceItems.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    purchaseCurrencyId: integer("purchase_currency_id")
      .notNull()
      .references(() => currencies.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    purchaseCurrencyRate: real("purchase_currency_rate").notNull(),
    unitCost: real("unit_cost").notNull(),
    initialQuantity: real("initial_quantity").notNull(),
    remainingQuantity: real("remaining_quantity").notNull(),
    receivedAt: text("received_at").notNull(),
  },
  (table) => [
    index("idx_inventory_lots_product").on(table.productId),
    index("idx_inventory_lots_remaining").on(table.remainingQuantity),
    index("idx_inventory_lots_received").on(table.receivedAt),
    check("ck_inventory_lots_initial_qty", sql`${table.initialQuantity} > 0`),
    check(
      "ck_inventory_lots_remaining_qty",
      sql`${table.remainingQuantity} >= 0`,
    ),
  ],
);
