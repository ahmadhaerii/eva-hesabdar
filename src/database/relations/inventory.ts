import { relations } from "drizzle-orm";

import { inventoryLots, inventoryTransactions } from "../schema/inventory";

import { products } from "../schema/master";

import { currencies } from "../schema/currency";

import { purchaseInvoiceItems } from "../schema/purchase";

import { salesInventoryAllocations } from "../schema/sales";

/* ==========================================================
   INVENTORY LOTS
========================================================== */

export const inventoryLotRelations = relations(
  inventoryLots,
  ({ one, many }) => ({
    product: one(products, {
      fields: [inventoryLots.productId],
      references: [products.id],
    }),

    purchaseItem: one(purchaseInvoiceItems, {
      fields: [inventoryLots.purchaseInvoiceItemId],
      references: [purchaseInvoiceItems.id],
    }),

    purchaseCurrency: one(currencies, {
      fields: [inventoryLots.purchaseCurrencyId],
      references: [currencies.id],
    }),

    transactions: many(inventoryTransactions),

    allocations: many(salesInventoryAllocations),
  }),
);

/* ==========================================================
   INVENTORY TRANSACTIONS
========================================================== */

export const inventoryTransactionRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    product: one(products, {
      fields: [inventoryTransactions.productId],
      references: [products.id],
    }),

    inventoryLot: one(inventoryLots, {
      fields: [inventoryTransactions.inventoryLotId],
      references: [inventoryLots.id],
    }),
  }),
);
