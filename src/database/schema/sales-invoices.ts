// src/database/schema/sales-invoices.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { contacts } from "./contacts";
import { currencies } from "./currencies";
import { currencyRates } from "./currency-rates";

export const salesInvoices = sqliteTable(
  "sales_invoices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    invoiceNumber: text("invoice_number").notNull(),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    currencyId: integer("currency_id")
      .notNull()
      .references(() => currencies.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    currencyRateId: integer("currency_rate_id")
      .notNull()
      .references(() => currencyRates.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    currencyRate: real("currency_rate").notNull(),
    invoiceDate: text("invoice_date").notNull(),
    description: text("description"),
    status: text("status").notNull().default("Draft"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at"),
  },
  (table) => [
    uniqueIndex("uq_sales_invoice_number").on(table.invoiceNumber),
    index("idx_sales_contact").on(table.contactId),
    index("idx_sales_date").on(table.invoiceDate),
    index("idx_sales_status").on(table.status),
    check(
      "ck_sales_invoices_status",
      sql`${table.status} IN ('Draft','Confirmed','Cancelled')`,
    ),
  ],
);
