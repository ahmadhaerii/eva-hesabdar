// src/services/fifo.service.ts
import { eq, and, asc, gt, sql } from "drizzle-orm";
import { db } from "@/database/client";
import { inventoryLots } from "@/database/schema1/inventory-lots";
import { inventoryTransactions } from "@/database/schema1/inventory-transactions";

// نوعی که هم db معمولی و هم tx داخل db.transaction() رو پوشش می‌ده
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Transaction;

export interface CreateLotInput {
  purchaseInvoiceItemId: number;
  productId: number;
  purchaseCurrencyId: number;
  purchaseCurrencyRate: number;
  unitCost: number;
  quantity: number;
  receivedAt: string;
}

export interface FifoAllocation {
  lotId: number;
  quantity: number;
  unitCost: number;
}

export const FIFOService = {
  async createLot(input: CreateLotInput, dbClient: DbOrTx = db) {
    const [lot] = await dbClient
      .insert(inventoryLots)
      .values({
        purchaseInvoiceItemId: input.purchaseInvoiceItemId,
        productId: input.productId,
        purchaseCurrencyId: input.purchaseCurrencyId,
        purchaseCurrencyRate: input.purchaseCurrencyRate,
        unitCost: input.unitCost,
        initialQuantity: input.quantity,
        remainingQuantity: input.quantity,
        receivedAt: input.receivedAt,
      })
      .returning();

    await dbClient.insert(inventoryTransactions).values({
      productId: input.productId,
      lotId: lot.id,
      transactionType: "IN",
      quantity: input.quantity,
      referenceTable: "purchase_invoice_items",
      referenceId: input.purchaseInvoiceItemId,
      transactionDate: input.receivedAt,
    });

    return lot;
  },

  async getAvailableQuantity(
    productId: number,
    dbClient: DbOrTx = db,
  ): Promise<number> {
    const result = await dbClient
      .select({
        total: sql<number>`COALESCE(SUM(${inventoryLots.remainingQuantity}), 0)`,
      })
      .from(inventoryLots)
      .where(eq(inventoryLots.productId, productId));

    return result[0]?.total ?? 0;
  },

  async consumeFifo(
    productId: number,
    quantity: number,
    reference: { table: string; id: number },
    transactionDate: string,
    dbClient: DbOrTx = db,
  ): Promise<FifoAllocation[]> {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const availableLots = await dbClient
      .select()
      .from(inventoryLots)
      .where(
        and(
          eq(inventoryLots.productId, productId),
          gt(inventoryLots.remainingQuantity, 0),
        ),
      )
      .orderBy(asc(inventoryLots.receivedAt));

    let remainingToConsume = quantity;
    const allocations: FifoAllocation[] = [];

    for (const lot of availableLots) {
      if (remainingToConsume <= 0) break;

      const consumeFromLot = Math.min(
        lot.remainingQuantity,
        remainingToConsume,
      );

      await dbClient
        .update(inventoryLots)
        .set({ remainingQuantity: lot.remainingQuantity - consumeFromLot })
        .where(eq(inventoryLots.id, lot.id));

      await dbClient.insert(inventoryTransactions).values({
        productId,
        lotId: lot.id,
        transactionType: "OUT",
        quantity: consumeFromLot,
        referenceTable: reference.table,
        referenceId: reference.id,
        transactionDate,
      });

      allocations.push({
        lotId: lot.id,
        quantity: consumeFromLot,
        unitCost: lot.unitCost,
      });
      remainingToConsume -= consumeFromLot;
    }

    if (remainingToConsume > 0) {
      throw new Error(
        `Insufficient stock for product ${productId}. Missing quantity: ${remainingToConsume}`,
      );
    }

    return allocations;
  },
};
