// src/database/schema/purchase-costs.ts
// این جدول همون "Freight" هست، اما به‌صورت عمومی‌تر (title/amount) تا در آینده
// انواع دیگه‌ی هزینه (بیمه، ترخیص و ...) هم بدون تغییر ساختار پشتیبانی بشه.
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

export const purchaseCosts = sqliteTable(
  "purchase_costs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    purchaseInvoiceId: integer("purchase_invoice_id")
      .notNull()
      .references(() => purchaseInvoices.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    title: text("title").notNull(),
    amount: real("amount").notNull(),
    description: text("description"),
  },
  (table) => [
    index("idx_purchase_costs_invoice").on(table.purchaseInvoiceId),
    check("ck_purchase_costs_amount", sql`${table.amount} >= 0`),
  ],
);
