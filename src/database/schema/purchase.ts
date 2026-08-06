import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { contacts, products } from "./master";
import { currencies, currencyRates } from "./currency";

/* ==========================================================
   PURCHASE INVOICES
========================================================== */

export const purchaseInvoices = sqliteTable(
  "purchase_invoices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    invoiceNumber: text("invoice_number").notNull(),

    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id),

    currencyId: integer("currency_id")
      .notNull()
      .references(() => currencies.id),

    currencyRateId: integer("currency_rate_id")
      .notNull()
      .references(() => currencyRates.id),

    currencyRate: real("currency_rate").notNull(),

    invoiceDate: text("invoice_date").notNull(),

    description: text("description"),

    status: text("status")
      .$type<"Draft" | "Confirmed" | "Cancelled">()
      .notNull()
      .default("Draft"),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),
  },
  (table) => ({
    invoiceUnique: uniqueIndex("uq_purchase_invoice_number").on(
      table.invoiceNumber,
    ),

    contactIndex: index("idx_purchase_contact").on(table.contactId),

    currencyIndex: index("idx_purchase_currency").on(table.currencyId),

    dateIndex: index("idx_purchase_date").on(table.invoiceDate),

    statusIndex: index("idx_purchase_status").on(table.status),
  }),
);

/* ==========================================================
   PURCHASE INVOICE ITEMS
========================================================== */

export const purchaseInvoiceItems = sqliteTable(
  "purchase_invoice_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    purchaseInvoiceId: integer("purchase_invoice_id")
      .notNull()
      .references(() => purchaseInvoices.id),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),

    quantity: real("quantity").notNull(),

    unitCost: real("unit_cost").notNull(),

    allocatedCost: real("allocated_cost").notNull().default(0),

    finalUnitCost: real("final_unit_cost").notNull(),

    lineTotal: real("line_total").notNull(),

    description: text("description"),
  },
  (table) => ({
    invoiceIndex: index("idx_purchase_items_invoice").on(
      table.purchaseInvoiceId,
    ),

    productIndex: index("idx_purchase_items_product").on(table.productId),
  }),
);

/* ==========================================================
   PURCHASE COSTS
========================================================== */

export const purchaseCosts = sqliteTable(
  "purchase_costs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    purchaseInvoiceId: integer("purchase_invoice_id")
      .notNull()
      .references(() => purchaseInvoices.id),

    title: text("title").notNull(),

    amount: real("amount").notNull(),

    description: text("description"),

    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    invoiceIndex: index("idx_purchase_cost_invoice").on(
      table.purchaseInvoiceId,
    ),
  }),
);
