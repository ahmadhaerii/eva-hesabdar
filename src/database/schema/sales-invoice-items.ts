// src/database/schema/sales-invoice-items.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { salesInvoices } from "./sales-invoices";
import { products } from "./products";
import { currencies } from "./currencies";

export const salesInvoiceItems = sqliteTable(
  "sales_invoice_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    salesInvoiceId: integer("sales_invoice_id")
      .notNull()
      .references(() => salesInvoices.id, {
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
    purchaseUnitCost: real("purchase_unit_cost").notNull(),
    purchaseCurrencyId: integer("purchase_currency_id")
      .notNull()
      .references(() => currencies.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    purchaseCurrencyRate: real("purchase_currency_rate").notNull(),
    suggestedUnitPrice: real("suggested_unit_price").notNull(),
    saleUnitPrice: real("sale_unit_price").notNull(),
    lineTotal: real("line_total").notNull(),
    description: text("description"),
  },
  (table) => [
    index("idx_sales_items_invoice").on(table.salesInvoiceId),
    index("idx_sales_items_product").on(table.productId),
    check("ck_sales_items_quantity", sql`${table.quantity} > 0`),
    check("ck_sales_items_sale_price", sql`${table.saleUnitPrice} >= 0`),
  ],
);
