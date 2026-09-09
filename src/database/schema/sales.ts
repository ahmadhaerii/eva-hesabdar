import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { customers, products } from "./master";
import { currencyRates } from "./currency";
import { purchaseInvoiceItems } from "./purchase";

/* ==========================================================
   SALES INVOICES
========================================================== */

export const salesInvoices = sqliteTable(
  "sales_invoices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    invoiceNumber: text("invoice_number").notNull(),

    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id),

    currencyRateId: integer("currency_rate_id")
      .notNull()
      .references(() => currencyRates.id),

    invoiceDate: text("invoice_date").notNull(),
    totalPrice: real("total_price").notNull(),

    description: text("description"),
    deletedAt: text("deleted_at"),
    status: text("status")
      .$type<"Draft" | "Confirmed" | "Cancelled">()
      .notNull()
      .default("Draft"),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),
  },
  (table) => ({
    invoiceUnique: uniqueIndex("uq_sales_invoice_number").on(
      table.invoiceNumber,
    ),

    dateIndex: index("idx_sales_date").on(table.invoiceDate),

    statusIndex: index("idx_sales_status").on(table.status),
  }),
);

/* ==========================================================
   SALES INVOICE ITEMS
========================================================== */

export const salesInvoiceItems = sqliteTable(
  "sales_invoice_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    salesInvoiceId: integer("sales_invoice_id")
      .notNull()
      .references(() => salesInvoices.id),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),

    quantity: real("quantity").notNull(),

    //  fifoUnitCost: real("fifo_unit_cost").notNull(),

    // purchaseCurrencyId: integer("purchase_currency_id")
    //   .notNull()
    //   .references(() => currencies.id),

    // purchaseCurrencyRate: real("purchase_currency_rate").notNull(),

    // Sale Snapshot
    // saleExchangeRate: real("sale_exchange_rate").notNull(),

    // customerProfitPercent: real("customer_profit_percent").notNull(),

    suggestedUnitPrice: real("suggested_unit_price").notNull(),

    // Final user price
    saleUnitPrice: real("sale_unit_price").notNull(),

    lineTotal: real("line_total").notNull(),

    description: text("description"),
  },
  (table) => ({
    invoiceIndex: index("idx_sales_items_invoice").on(table.salesInvoiceId),

    productIndex: index("idx_sales_items_product").on(table.productId),
  }),
);

/* ==========================================================
   SALES INVENTORY ALLOCATIONS
========================================================== */

export const salesInventoryAllocations = sqliteTable(
  "sales_inventory_allocations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    salesInvoiceItemId: integer("sales_invoice_item_id")
      .notNull()
      .references(() => salesInvoiceItems.id),

    purchaseInvoiceItemId: integer("purchase_invoice_item_id")
      .notNull()
      .references(() => purchaseInvoiceItems.id),

    quantity: real("quantity").notNull(),

    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    itemIndex: index("idx_sales_alloc_item").on(table.salesInvoiceItemId),

    lotIndex: index("idx_sales_alloc_purchase_invoice_item").on(
      table.purchaseInvoiceItemId,
    ),
  }),
);
