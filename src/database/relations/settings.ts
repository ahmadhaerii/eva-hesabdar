import { relations } from "drizzle-orm";

import { currencyConversions, settings } from "../schema/settings";

import { currencies, currencyRates } from "../schema/currency";

/* ==========================================================
   CURRENCY CONVERSIONS
========================================================== */

export const currencyConversionRelations = relations(
  currencyConversions,
  ({ one }) => ({
    fromCurrency: one(currencies, {
      relationName: "conversion_from",
      fields: [currencyConversions.fromCurrencyId],
      references: [currencies.id],
    }),

    toCurrency: one(currencies, {
      relationName: "conversion_to",
      fields: [currencyConversions.toCurrencyId],
      references: [currencies.id],
    }),

    expectedRate: one(currencyRates, {
      fields: [currencyConversions.expectedRateId],
      references: [currencyRates.id],
    }),
  }),
);

/* ==========================================================
   SETTINGS
========================================================== */

export const settingRelations = relations(settings, () => ({}));
