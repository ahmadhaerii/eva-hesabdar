import { relations } from "drizzle-orm";

import {
  salesInvoices,
  salesInvoiceItems,
  salesInventoryAllocations,
} from "../schema/sales";

import { contacts, products } from "../schema/master";

import { currencies, currencyRates } from "../schema/currency";

import { inventoryLots } from "../schema/inventory";

/* ==========================================================
   SALES INVOICES
========================================================== */

export const salesInvoiceRelations = relations(
  salesInvoices,
  ({ one, many }) => ({
    contact: one(contacts, {
      fields: [salesInvoices.contactId],
      references: [contacts.id],
    }),

    currencyRate: one(currencyRates, {
      fields: [salesInvoices.currencyRateId],
      references: [currencyRates.id],
    }),

    items: many(salesInvoiceItems),
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

    purchaseCurrency: one(currencies, {
      fields: [salesInvoiceItems.purchaseCurrencyId],
      references: [currencies.id],
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

    inventoryLot: one(inventoryLots, {
      fields: [salesInventoryAllocations.inventoryLotId],
      references: [inventoryLots.id],
    }),
  }),
);
