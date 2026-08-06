import { relations } from "drizzle-orm";

import {
  categories,
  contacts,
  customerProfiles,
  customerTypes,
  products,
  units,
} from "../schema/master";

import { purchaseInvoiceItems, purchaseInvoices } from "../schema/purchase";

import { inventoryLots, inventoryTransactions } from "../schema/inventory";

import { salesInvoiceItems, salesInvoices } from "../schema/sales";

/* ==========================================================
   CUSTOMER TYPES
========================================================== */

export const customerTypeRelations = relations(customerTypes, ({ many }) => ({
  customers: many(customerProfiles),
}));

/* ==========================================================
   CONTACTS
========================================================== */

export const contactRelations = relations(contacts, ({ one, many }) => ({
  profile: one(customerProfiles),

  purchaseInvoices: many(purchaseInvoices),

  salesInvoices: many(salesInvoices),
}));

/* ==========================================================
   CUSTOMER PROFILE
========================================================== */

export const customerProfileRelations = relations(
  customerProfiles,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [customerProfiles.contactId],
      references: [contacts.id],
    }),

    customerType: one(customerTypes, {
      fields: [customerProfiles.customerTypeId],
      references: [customerTypes.id],
    }),
  }),
);

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
