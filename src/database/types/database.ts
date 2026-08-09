import * as schema from "../schema";

/* ==========================================================
   MASTER
========================================================== */

export type CustomerType = typeof schema.customerTypes.$inferSelect;
export type NewCustomerType = typeof schema.customerTypes.$inferInsert;

export type Contact = typeof schema.contacts.$inferSelect;
export type NewContact = typeof schema.contacts.$inferInsert;

export type CustomerProfile = typeof schema.customerProfiles.$inferSelect;
export type NewCustomerProfile = typeof schema.customerProfiles.$inferInsert;

export type Unit = typeof schema.units.$inferSelect;
export type NewUnit = typeof schema.units.$inferInsert;

export type Category = typeof schema.categories.$inferSelect;
export type NewCategory = typeof schema.categories.$inferInsert;

export type Product = typeof schema.products.$inferSelect;
export type NewProduct = typeof schema.products.$inferInsert;
export type ProductWithRelations = Product & {
  category: Category | null;
  unit: Unit | null;
};
/* ==========================================================
   CURRENCY
========================================================== */

export type Currency = typeof schema.currencies.$inferSelect;
export type NewCurrency = typeof schema.currencies.$inferInsert;

export type CurrencyRate = typeof schema.currencyRates.$inferSelect;
export type NewCurrencyRate = typeof schema.currencyRates.$inferInsert;

/* ==========================================================
   PURCHASE
========================================================== */

export type PurchaseInvoice = typeof schema.purchaseInvoices.$inferSelect;

export type NewPurchaseInvoice = typeof schema.purchaseInvoices.$inferInsert;

export type PurchaseInvoiceItem =
  typeof schema.purchaseInvoiceItems.$inferSelect;

export type NewPurchaseInvoiceItem =
  typeof schema.purchaseInvoiceItems.$inferInsert;

export type PurchaseCost = typeof schema.purchaseCosts.$inferSelect;

export type NewPurchaseCost = typeof schema.purchaseCosts.$inferInsert;

/* ==========================================================
   INVENTORY
========================================================== */

export type InventoryLot = typeof schema.inventoryLots.$inferSelect;

export type NewInventoryLot = typeof schema.inventoryLots.$inferInsert;

export type InventoryTransaction =
  typeof schema.inventoryTransactions.$inferSelect;

export type NewInventoryTransaction =
  typeof schema.inventoryTransactions.$inferInsert;

/* ==========================================================
   SALES
========================================================== */

export type SalesInvoice = typeof schema.salesInvoices.$inferSelect;

export type NewSalesInvoice = typeof schema.salesInvoices.$inferInsert;

export type SalesInvoiceItem = typeof schema.salesInvoiceItems.$inferSelect;

export type NewSalesInvoiceItem = typeof schema.salesInvoiceItems.$inferInsert;

export type SalesInventoryAllocation =
  typeof schema.salesInventoryAllocations.$inferSelect;

export type NewSalesInventoryAllocation =
  typeof schema.salesInventoryAllocations.$inferInsert;

/* ==========================================================
   SETTINGS
========================================================== */

export type CurrencyConversion = typeof schema.currencyConversions.$inferSelect;

export type NewCurrencyConversion =
  typeof schema.currencyConversions.$inferInsert;

export type Setting = typeof schema.settings.$inferSelect;

export type NewSetting = typeof schema.settings.$inferInsert;
