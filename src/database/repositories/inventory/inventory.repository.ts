import { and, asc, desc, eq, gt, sql } from "drizzle-orm";

import { db } from "../../client";

import { inventoryLots, inventoryTransactions } from "../../schema";

import {
  InventoryLot,
  InventoryTransaction,
  NewInventoryLot,
  NewInventoryTransaction,
} from "../../types/database";
import { BaseRepository } from "../base.repository";

export class InventoryRepository extends BaseRepository {
  /* ==========================================================
     INVENTORY LOTS
  ========================================================== */

  async createLot(data: NewInventoryLot) {
    return this.executor.insert(inventoryLots).values(data).returning();
  }

  async updateLot(id: number, data: Partial<NewInventoryLot>) {
    return db
      .update(inventoryLots)
      .set(data)
      .where(eq(inventoryLots.id, id))
      .returning();
  }

  async getLotById(id: number): Promise<InventoryLot | undefined> {
    return this.executor.query.inventoryLots.findFirst({
      where: eq(inventoryLots.id, id),
    });
  }

  async getLotsByProduct(productId: number): Promise<InventoryLot[]> {
    return this.executor.query.inventoryLots.findMany({
      where: eq(inventoryLots.productId, productId),

      orderBy: [asc(inventoryLots.receivedAt), asc(inventoryLots.id)],
    });
  }

  async getAvailableLots(productId: number): Promise<InventoryLot[]> {
    return this.executor.query.inventoryLots.findMany({
      where: and(
        eq(inventoryLots.productId, productId),
        gt(inventoryLots.remainingQuantity, 0),
      ),

      orderBy: [asc(inventoryLots.receivedAt), asc(inventoryLots.id)],
    });
  }

  async getCurrentStock(productId: number): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`
          COALESCE(SUM(${inventoryLots.remainingQuantity}),0)
        `,
      })
      .from(inventoryLots)
      .where(eq(inventoryLots.productId, productId));

    return result[0]?.total ?? 0;
  }

  /* ==========================================================
     INVENTORY TRANSACTIONS
  ========================================================== */

  async createTransaction(data: NewInventoryTransaction) {
    return this.executor.insert(inventoryTransactions).values(data).returning();
  }

  async getTransactions(productId: number): Promise<InventoryTransaction[]> {
    return this.executor.query.inventoryTransactions.findMany({
      where: eq(inventoryTransactions.productId, productId),

      orderBy: [
        desc(inventoryTransactions.transactionDate),
        desc(inventoryTransactions.id),
      ],
    });
  }

  async getTransactionByReference(referenceTable: string, referenceId: number) {
    return this.executor.query.inventoryTransactions.findMany({
      where: and(
        eq(inventoryTransactions.referenceTable, referenceTable),
        eq(inventoryTransactions.referenceId, referenceId),
      ),
    });
  }
  async getLotsByPurchaseInvoiceItem(purchaseInvoiceItemId: number) {
    return this.executor.query.inventoryLots.findFirst({
      where: eq(inventoryLots.purchaseInvoiceItemId, purchaseInvoiceItemId),
    });
  }
  async getLotByPurchaseInvoiceItem(purchaseInvoiceItemId: number) {
    return this.executor.query.inventoryLots.findFirst({
      where: eq(inventoryLots.purchaseInvoiceItemId, purchaseInvoiceItemId),
    });
  }
  async updateRemainingQuantity(lotId: number, remainingQuantity: number) {
    return this.executor
      .update(inventoryLots)
      .set({
        remainingQuantity,
      })
      .where(eq(inventoryLots.id, lotId))
      .returning();
  }
}

export const inventoryRepository = new InventoryRepository();
