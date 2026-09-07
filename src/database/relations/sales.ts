import { relations } from "drizzle-orm";

import {
  salesInvoices,
  salesInvoiceItems,
  salesInventoryAllocations,
} from "../schema/sales";

import { customers, products } from "../schema/master";

import { currencies, currencyRates } from "../schema/currency";

import { inventoryLots } from "../schema/inventory";
import { purchaseInvoiceItems } from "../schema";

/* ==========================================================
   SALES INVOICES
========================================================== */

export const salesInvoiceRelations = relations(
  salesInvoices,
  ({ one, many }) => ({
    currencyRate: one(currencyRates, {
      fields: [salesInvoices.currencyRateId],
      references: [currencyRates.id],
    }),
    customer: one(customers, {
      fields: [salesInvoices.customerId],
      references: [customers.id],
    }),

    saleInvoiceItems: many(salesInvoiceItems),
  }),
);

/* ==========================================================
   SALES INVOICE ITEMS
========================================================== */

export const salesInvoiceItemRelations = relations(
  salesInvoiceItems,
  ({ one, many }) => ({
    invoice: one(salesInvoices, {
      fields: [salesInvoiceItems.salesInvoiceId],
      references: [salesInvoices.id],
    }),

    product: one(products, {
      fields: [salesInvoiceItems.productId],
      references: [products.id],
    }),

    allocations: many(salesInventoryAllocations),
  }),
);

/* ==========================================================
   SALES INVENTORY ALLOCATIONS
========================================================== */

export const salesInventoryAllocationRelations = relations(
  salesInventoryAllocations,
  ({ one }) => ({
    salesItem: one(salesInvoiceItems, {
      fields: [salesInventoryAllocations.salesInvoiceItemId],
      references: [salesInvoiceItems.id],
    }),

    purchaseInvoiceItem: one(purchaseInvoiceItems, {
      fields: [salesInventoryAllocations.purchaseInvoiceItemId],
      references: [purchaseInvoiceItems.id],
    }),
  }),
);
