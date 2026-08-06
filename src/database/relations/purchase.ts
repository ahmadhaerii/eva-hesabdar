import { relations } from "drizzle-orm";

import {
  purchaseInvoices,
  purchaseInvoiceItems,
  purchaseCosts,
} from "../schema/purchase";

import { contacts, products } from "../schema/master";

import { currencies, currencyRates } from "../schema/currency";

import { inventoryLots } from "../schema/inventory";

/* ==========================================================
   PURCHASE INVOICES
========================================================== */

export const purchaseInvoiceRelations = relations(
  purchaseInvoices,
  ({ one, many }) => ({
    contact: one(contacts, {
      fields: [purchaseInvoices.contactId],
      references: [contacts.id],
    }),

    currency: one(currencies, {
      fields: [purchaseInvoices.currencyId],
      references: [currencies.id],
    }),

    currencyRate: one(currencyRates, {
      fields: [purchaseInvoices.currencyRateId],
      references: [currencyRates.id],
    }),

    items: many(purchaseInvoiceItems),

    costs: many(purchaseCosts),
  }),
);

/* ==========================================================
   PURCHASE INVOICE ITEMS
========================================================== */

export const purchaseInvoiceItemRelations = relations(
  purchaseInvoiceItems,
  ({ one, many }) => ({
    invoice: one(purchaseInvoices, {
      fields: [purchaseInvoiceItems.purchaseInvoiceId],
      references: [purchaseInvoices.id],
    }),

    product: one(products, {
      fields: [purchaseInvoiceItems.productId],
      references: [products.id],
    }),

    inventoryLots: many(inventoryLots),
  }),
);

/* ==========================================================
   PURCHASE COSTS
========================================================== */

export const purchaseCostRelations = relations(purchaseCosts, ({ one }) => ({
  invoice: one(purchaseInvoices, {
    fields: [purchaseCosts.purchaseInvoiceId],
    references: [purchaseInvoices.id],
  }),
}));
