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
        saleInvoiceItems: {
          with: {
            allocations: true,
            product: true,
          },
        },
      },

      orderBy: [desc(salesInvoices.invoiceDate)],
    });
  }
  async getSaleInvoice(
    id: number,
  ): Promise<SalesInvoiceWithRelations | undefined> {
    return this.executor.query.salesInvoices.findFirst({
      with: {
        currencyRate: {
          with: {
            currency: true,
          },
        },
        customer: true,
        saleInvoiceItems: {
          with: {
            product: true,
            allocations: true,
          },
        },
      },
      where: eq(salesInvoices.id, id),
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

  async deleteInvoiceItem(id: number) {
    return this.executor
      .delete(salesInvoiceItems)
      .where(eq(salesInvoiceItems.id, id));
  }
  async deleteAllocation(id: number) {
    return this.executor
      .delete(salesInventoryAllocations)
      .where(eq(salesInventoryAllocations.id, id));
  }

  async updateSaleInvoicePrice(
    id: number,
    totalPrice: number,
    amountPayable: number,
  ) {
    return db
      .update(salesInvoices)
      .set({
        totalPrice,
        amountPayable,
      })
      .where(eq(salesInvoices.id, id))
      .returning();
  }
}

export const salesRepository = new SalesRepository();
