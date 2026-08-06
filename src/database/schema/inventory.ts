import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { products } from "./master";
import { currencies } from "./currency";
import { purchaseInvoiceItems } from "./purchase";

/* ==========================================================
   INVENTORY LOTS
========================================================== */

export const inventoryLots = sqliteTable(
  "inventory_lots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    purchaseInvoiceItemId: integer("purchase_invoice_item_id")
      .notNull()
      .references(() => purchaseInvoiceItems.id),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),

    purchaseCurrencyId: integer("purchase_currency_id")
      .notNull()
      .references(() => currencies.id),

    purchaseCurrencyRate: real("purchase_currency_rate").notNull(),

    unitCost: real("unit_cost").notNull(),

    allocatedCost: real("allocated_cost").notNull().default(0),

    finalUnitCost: real("final_unit_cost").notNull(),

    initialQuantity: real("initial_quantity").notNull(),

    remainingQuantity: real("remaining_quantity").notNull(),

    receivedAt: text("received_at").notNull(),

    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    productIndex: index("idx_inventory_lots_product").on(table.productId),

    fifoIndex: index("idx_inventory_lots_fifo").on(
      table.productId,
      table.receivedAt,
      table.id,
    ),

    remainingIndex: index("idx_inventory_lots_remaining").on(
      table.productId,
      table.remainingQuantity,
    ),
  }),
);

/* ==========================================================
   INVENTORY TRANSACTIONS
========================================================== */

export const inventoryTransactions = sqliteTable(
  "inventory_transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),

    inventoryLotId: integer("inventory_lot_id").references(
      () => inventoryLots.id,
    ),

    transactionType: text("transaction_type")
      .$type<"Purchase" | "Sale" | "Adjustment">()
      .notNull(),

    quantity: real("quantity").notNull(),

    referenceTable: text("reference_table").notNull(),

    referenceId: integer("reference_id").notNull(),

    transactionDate: text("transaction_date").notNull(),

    description: text("description"),

    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    productIndex: index("idx_inventory_tx_product").on(table.productId),

    lotIndex: index("idx_inventory_tx_lot").on(table.inventoryLotId),

    dateIndex: index("idx_inventory_tx_date").on(table.transactionDate),

    referenceIndex: index("idx_inventory_tx_reference").on(
      table.referenceTable,
      table.referenceId,
    ),
  }),
);
