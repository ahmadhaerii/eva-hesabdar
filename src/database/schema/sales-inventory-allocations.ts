// src/database/schema/sales-inventory-allocations.ts
// این جدول پل بین یک ردیف فاکتور فروش و LOT های مصرف‌شده (FIFO) هست.
// یک ردیف فروش می‌تونه از چند LOT مختلف تامین بشه.
import {
  sqliteTable,
  integer,
  real,
  index,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { salesInvoiceItems } from "./sales-invoice-items";
import { inventoryLots } from "./inventory-lots";

export const salesInventoryAllocations = sqliteTable(
  "sales_inventory_allocations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    salesInvoiceItemId: integer("sales_invoice_item_id")
      .notNull()
      .references(() => salesInvoiceItems.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    inventoryLotId: integer("inventory_lot_id")
      .notNull()
      .references(() => inventoryLots.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    quantity: real("quantity").notNull(),
    purchaseUnitCost: real("purchase_unit_cost").notNull(),
  },
  (table) => [
    index("idx_sales_alloc_item").on(table.salesInvoiceItemId),
    index("idx_sales_alloc_lot").on(table.inventoryLotId),
    check("ck_sales_alloc_quantity", sql`${table.quantity} > 0`),
  ],
);
