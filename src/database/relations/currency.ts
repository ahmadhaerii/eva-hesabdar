import { relations } from "drizzle-orm";

import { currencies, currencyRates } from "../schema/currency";

import { purchaseInvoices } from "../schema/purchase";
import { inventoryLots } from "../schema/inventory";
import { salesInvoiceItems } from "../schema/sales";
import { currencyConversions } from "../schema/settings";
import { customerPayments } from "../schema";

/* ==========================================================
   CURRENCIES
========================================================== */

export const currencyRelations = relations(currencies, ({ many }) => ({
  rates: many(currencyRates),

  purchaseInvoices: many(purchaseInvoices),

  inventoryLots: many(inventoryLots),

  salesItems: many(salesInvoiceItems),

  conversionFrom: many(currencyConversions, {
    relationName: "conversion_from",
  }),

  conversionTo: many(currencyConversions, {
    relationName: "conversion_to",
  }),
}));

/* ==========================================================
   CURRENCY RATES
========================================================== */

export const currencyRateRelations = relations(
  currencyRates,
  ({ one, many }) => ({
    currency: one(currencies, {
      fields: [currencyRates.currencyId],
      references: [currencies.id],
    }),

    purchaseInvoices: many(purchaseInvoices),

    salesInvoices: many(purchaseInvoices),
    customerPayments: many(customerPayments),

    conversions: many(currencyConversions),
  }),
);
