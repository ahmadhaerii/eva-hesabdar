import { relations } from "drizzle-orm";

import { categories, customerTypes, products, units } from "../schema/master";

import { purchaseInvoiceItems, purchaseInvoices } from "../schema/purchase";

import { inventoryLots, inventoryTransactions } from "../schema/inventory";

import { salesInvoiceItems, salesInvoices } from "../schema/sales";

/* ==========================================================
   CATEGORIES
========================================================== */

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

/* ==========================================================
   UNITS
========================================================== */

export const unitRelations = relations(units, ({ many }) => ({
  products: many(products),
}));

/* ==========================================================
   PRODUCTS
========================================================== */

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),

  unit: one(units, {
    fields: [products.unitId],
    references: [units.id],
  }),

  purchaseItems: many(purchaseInvoiceItems),

  inventoryLots: many(inventoryLots),

  inventoryTransactions: many(inventoryTransactions),

  salesItems: many(salesInvoiceItems),
}));
