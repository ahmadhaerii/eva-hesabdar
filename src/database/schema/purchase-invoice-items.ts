// src/database/schema/purchase-invoice-items.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { purchaseInvoices } from "./purchase-invoices";
import { products } from "./products";

export const purchaseInvoiceItems = sqliteTable(
  "purchase_invoice_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    purchaseInvoiceId: integer("purchase_invoice_id")
      .notNull()
      .references(() => purchaseInvoices.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    quantity: real("quantity").notNull(),
    unitCost: real("unit_cost").notNull(),
    lineTotal: real("line_total").notNull(),
    description: text("description"),
  },
  (table) => [
    index("idx_purchase_items_invoice").on(table.purchaseInvoiceId),
    index("idx_purchase_items_product").on(table.productId),
    check("ck_purchase_items_quantity", sql`${table.quantity} > 0`),
    check("ck_purchase_items_unit_cost", sql`${table.unitCost} >= 0`),
  ],
);
