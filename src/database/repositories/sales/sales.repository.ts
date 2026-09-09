import { asc, desc, eq } from "drizzle-orm";

import { db } from "../../client";

import {
  salesInvoices,
  salesInvoiceItems,
  salesInventoryAllocations,
} from "../../schema";

import {
  NewSalesInvoice,
  NewSalesInvoiceItem,
  NewSalesInventoryAllocation,
  SalesInvoice,
  SalesInvoiceItem,
  SalesInventoryAllocation,
  SalesInvoiceWithRelations,
} from "../../types/database";
import { BaseRepository } from "../base.repository";
import { currency } from "@/ipc/currencies";

export class SalesRepository extends BaseRepository {
  async listSaleInvoices(): Promise<SalesInvoiceWithRelations[]> {
    return this.executor.query.salesInvoices.findMany({
      with: {
        currencyRate: {
          with: {
            currency: true,
          },
        },
        customer: true,
        saleInvoiceItems: true,
      },

      orderBy: [desc(salesInvoices.invoiceDate)],
    });
  }

  async createSaleInvoice(data: NewSalesInvoice) {
    return this.executor.insert(salesInvoices).values(data).returning();
  }

  async addSaleInvoiceItem(data: NewSalesInvoiceItem) {
    return this.executor.insert(salesInvoiceItems).values(data).returning();
  }

  async createAllocation(data: NewSalesInventoryAllocation) {
    return this.executor
      .insert(salesInventoryAllocations)
      .values(data)
      .returning();
  }

  // // remove below
  // /* ==========================================================
  //    SALES INVOICES
  // ========================================================== */

  // async list(): Promise<SalesInvoice[]> {
  //   return this.executor.query.salesInvoices.findMany({
  //     with: {
  //       contact: true,
  //       currencyRate: true,
  //       items: true,
  //     },

  //     orderBy: [desc(salesInvoices.invoiceDate)],
  //   });
  // }

  // async getById(id: number): Promise<SalesInvoice | undefined> {
  //   return this.executor.query.salesInvoices.findFirst({
  //     where: eq(salesInvoices.id, id),

  //     with: {
  //       contact: true,

  //       currencyRate: true,

  //       items: {
  //         with: {
  //           product: true,
  //           purchaseCurrency: true,
  //           allocations: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // async createInvoice(data: NewSalesInvoice) {
  //   return this.executor.insert(salesInvoices).values(data).returning();
  // }

  // async updateInvoice(id: number, data: Partial<NewSalesInvoice>) {
  //   return db
  //     .update(salesInvoices)
  //     .set(data)
  //     .where(eq(salesInvoices.id, id))
  //     .returning();
  // }

  // async deleteInvoice(id: number) {
  //   return this.executor.delete(salesInvoices).where(eq(salesInvoices.id, id));
  // }

  // async changeStatus(id: number, status: "Draft" | "Confirmed" | "Cancelled") {
  //   return db
  //     .update(salesInvoices)
  //     .set({
  //       status,
  //     })
  //     .where(eq(salesInvoices.id, id))
  //     .returning();
  // }

  // async delete(id: number) {
  //   return this.executor
  //     .update(salesInvoices)
  //     .set({
  //       deletedAt: new Date().toISOString(),
  //     })
  //     .where(eq(salesInvoices.id, id))
  //     .returning();
  // }

  // /* ==========================================================
  //    SALES ITEMS
  // ========================================================== */

  // async getItems(invoiceId: number): Promise<SalesInvoiceItem[]> {
  //   return this.executor.query.salesInvoiceItems.findMany({
  //     where: eq(salesInvoiceItems.salesInvoiceId, invoiceId),

  //     with: {
  //       product: true,
  //       purchaseCurrency: true,
  //       allocations: true,
  //     },

  //     orderBy: [asc(salesInvoiceItems.id)],
  //   });
  // }

  // async updateItem(id: number, data: Partial<NewSalesInvoiceItem>) {
  //   return db
  //     .update(salesInvoiceItems)
  //     .set(data)
  //     .where(eq(salesInvoiceItems.id, id))
  //     .returning();
  // }

  // async deleteItem(id: number) {
  //   return this.executor
  //     .delete(salesInvoiceItems)
  //     .where(eq(salesInvoiceItems.id, id));
  // }

  // /* ==========================================================
  //    FIFO ALLOCATIONS
  // ========================================================== */

  // async getAllocations(
  //   salesItemId: number,
  // ): Promise<SalesInventoryAllocation[]> {
  //   return this.executor.query.salesInventoryAllocations.findMany({
  //     where: eq(salesInventoryAllocations.salesInvoiceItemId, salesItemId),

  //     with: {
  //       inventoryLot: true,
  //     },

  //     orderBy: [asc(salesInventoryAllocations.id)],
  //   });
  // }

  // async addAllocation(data: NewSalesInventoryAllocation) {
  //   return this.executor
  //     .insert(salesInventoryAllocations)
  //     .values(data)
  //     .returning();
  // }

  // async deleteAllocations(salesItemId: number) {
  //   return db
  //     .delete(salesInventoryAllocations)
  //     .where(eq(salesInventoryAllocations.salesInvoiceItemId, salesItemId));
  // }
}

export const salesRepository = new SalesRepository();
