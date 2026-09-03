import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "../../client";

import { purchaseInvoices, purchaseInvoiceItems } from "../../schema";

import {
  NewPurchaseInvoice,
  PurchaseInvoice,
  NewPurchaseInvoiceItem,
  PurchaseInvoiceItem,
  PurchaseInvoiceWithRelations,
  PurchaseInvoiceItemWithRelations,
} from "../../types/database";
import { BaseRepository } from "../base.repository";

export class PurchaseRepository extends BaseRepository {
  /* ==========================================================
     PURCHASE INVOICES
  ========================================================== */

  async listPurchaseInvoices(): Promise<PurchaseInvoiceWithRelations[]> {
    return this.executor.query.purchaseInvoices.findMany({
      with: {
        currency: true,
        currencyRate: true,
        items: true,
      },

      orderBy: [desc(purchaseInvoices.invoiceDate)],
    });
  }

  // async getById(id: number): Promise<PurchaseInvoice | undefined> {
  //   return this.executor.query.purchaseInvoices.findFirst({
  //     where: eq(purchaseInvoices.id, id),

  //     with: {
  //       contact: true,
  //       currency: true,
  //       currencyRate: true,

  //       items: {
  //         with: {
  //           product: true,
  //         },
  //       },

  //       costs: true,
  //     },
  //   });
  // }

  async createPurchaseInvoice(data: NewPurchaseInvoice) {
    return this.executor.insert(purchaseInvoices).values(data).returning();
  }

  async updatePurchaseInvoice(id: number, data: Partial<NewPurchaseInvoice>) {
    return db
      .update(purchaseInvoices)
      .set(data)
      .where(eq(purchaseInvoices.id, id))
      .returning();
  }

  async deletePurchaseInvoice(id: number) {
    return this.executor
      .delete(purchaseInvoices)
      .where(eq(purchaseInvoices.id, id));
  }

  /* ==========================================================
     PURCHASE ITEMS
  ========================================================== */

  async listPurchaseInvoiceItems(
    invoiceId: number,
  ): Promise<PurchaseInvoiceItemWithRelations[]> {
    return this.executor.query.purchaseInvoiceItems.findMany({
      where: eq(purchaseInvoiceItems.purchaseInvoiceId, invoiceId),

      with: {
        product: true,
      },

      orderBy: [asc(purchaseInvoiceItems.id)],
    });
  }

  async addPurchaseInvoiceItem(data: NewPurchaseInvoiceItem) {
    return this.executor.insert(purchaseInvoiceItems).values(data).returning();
  }

  async updatePurchaseInvoiceItem(
    id: number,
    data: Partial<NewPurchaseInvoiceItem>,
  ) {
    return db
      .update(purchaseInvoiceItems)
      .set(data)
      .where(eq(purchaseInvoiceItems.id, id))
      .returning();
  }

  async deletePurchaseInvoiceItem(id: number) {
    return db
      .delete(purchaseInvoiceItems)
      .where(eq(purchaseInvoiceItems.id, id));
  }

  // /* ==========================================================
  //    PURCHASE COSTS
  // ========================================================== */

  // async getCosts(invoiceId: number): Promise<PurchaseCost[]> {
  //   return this.executor.query.purchaseCosts.findMany({
  //     where: eq(purchaseCosts.purchaseInvoiceId, invoiceId),

  //     orderBy: [asc(purchaseCosts.id)],
  //   });
  // }

  // async addCost(data: NewPurchaseCost) {
  //   return this.executor.insert(purchaseCosts).values(data).returning();
  // }

  // async updateCost(id: number, data: Partial<NewPurchaseCost>) {
  //   return db
  //     .update(purchaseCosts)
  //     .set(data)
  //     .where(eq(purchaseCosts.id, id))
  //     .returning();
  // }

  // async deleteCost(id: number) {
  //   return this.executor.delete(purchaseCosts).where(eq(purchaseCosts.id, id));
  // }

  // /* ==========================================================
  //    STATUS
  // ========================================================== */

  // async changeStatus(id: number, status: "Draft" | "Confirmed" | "Cancelled") {
  //   return db
  //     .update(purchaseInvoices)
  //     .set({
  //       status,
  //     })
  //     .where(eq(purchaseInvoices.id, id))
  //     .returning();
  // }
}

export const purchaseRepository = new PurchaseRepository();
