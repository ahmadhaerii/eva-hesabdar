import { relations } from "drizzle-orm";
import { customers, customerTypes } from "../schema";

export const customerTypeRelations = relations(customerTypes, ({ many }) => ({
  customers: many(customers),
}));

export const customerRelations = relations(customers, ({ one }) => ({
  customerType: one(customerTypes, {
    fields: [customers.customerTypeId],
    references: [customerTypes.id],
  }),
}));
