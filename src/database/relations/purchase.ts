import { relations } from "drizzle-orm";

import { purchaseInvoices, purchaseInvoiceItems } from "../schema/purchase";

import { products } from "../schema/master";

import { currencies, currencyRates } from "../schema/currency";
import { salesInventoryAllocations } from "../schema";

/* ==========================================================
   PURCHASE INVOICES
========================================================== */

export const purchaseInvoiceRelations = relations(
  purchaseInvoices,
  ({ one, many }) => ({
    currency: one(currencies, {
      fields: [purchaseInvoices.currencyId],
      references: [currencies.id],
    }),

    currencyRate: one(currencyRates, {
      fields: [purchaseInvoices.currencyRateId],
      references: [currencyRates.id],
    }),

    purchaseInvoiceItems: many(purchaseInvoiceItems),
  }),
);

/* ==========================================================
   PURCHASE INVOICE ITEMS
========================================================== */

export const purchaseInvoiceItemRelations = relations(
  purchaseInvoiceItems,
  ({ one, many }) => ({
    purchaseInvoice: one(purchaseInvoices, {
      fields: [purchaseInvoiceItems.purchaseInvoiceId],
      references: [purchaseInvoices.id],
    }),

    product: one(products, {
      fields: [purchaseInvoiceItems.productId],
      references: [products.id],
    }),
    allocations: many(salesInventoryAllocations),

    // inventoryLots: many(inventoryLots),
  }),
);

// /* ==========================================================
//    PURCHASE COSTS
// ========================================================== */

// export const purchaseCostRelations = relations(purchaseCosts, ({ one }) => ({
//   invoice: one(purchaseInvoices, {
//     fields: [purchaseCosts.purchaseInvoiceId],
//     references: [purchaseInvoices.id],
//   }),
// }));
