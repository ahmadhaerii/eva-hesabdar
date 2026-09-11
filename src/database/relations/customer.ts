import { relations } from "drizzle-orm";
import {
  currencyRates,
  customerPayments,
  customers,
  customerTypes,
} from "../schema";

export const customerTypeRelations = relations(customerTypes, ({ many }) => ({
  customers: many(customers),
}));

export const customerPaymentsRelations = relations(
  customerPayments,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [customerPayments.customerId],
      references: [customers.id],
    }),
    currencyRate: one(currencyRates, {
      fields: [customerPayments.currencyRateId],
      references: [currencyRates.id],
    }),
  }),
);

export const customerRelations = relations(customers, ({ one, many }) => ({
  customerType: one(customerTypes, {
    fields: [customers.customerTypeId],
    references: [customerTypes.id],
  }),
  customerPayments: many(customerPayments),
}));
