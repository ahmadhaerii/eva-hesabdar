import { db } from "../database/client";

import { UnitOfWork } from "../database/unit-of-work";

import {
  NewPurchaseCost,
  NewPurchaseInvoice,
  NewPurchaseInvoiceItem,
} from "../database/types/database";

export interface CreatePurchaseInvoiceDto {
  invoice: NewPurchaseInvoice;

  items: NewPurchaseInvoiceItem[];

  costs: NewPurchaseCost[];
}

export class PurchaseService {
  constructor() {}

  /* ==========================================================
     CREATE PURCHASE
  ========================================================== */

  async create(dto: CreatePurchaseInvoiceDto) {
    return db.transaction(async (tx) => {
      const uow = new UnitOfWork(tx);

      /*
       * Step 1
       * Create Invoice
       */

      const [invoice] = await uow.purchase.createInvoice(dto.invoice);

      /*
       * Step 2
       * Create Items
       */

      for (const item of dto.items) {
        await uow.purchase.addItem({
          ...item,
          purchaseInvoiceId: invoice.id,
        });
      }

      /*
       * Step 3
       * Create Costs
       */

      for (const cost of dto.costs) {
        await uow.purchase.addCost({
          ...cost,
          purchaseInvoiceId: invoice.id,
        });
      }

      /*
       * Step 4
       */

      await this.allocateCosts(uow, invoice.id);

      /*
       * Step 5
       */

      await this.createInventoryLots(
        uow,
        invoice.id,
        invoice.currencyId,
        invoice.currencyRate,
        invoice.invoiceDate,
      );

      /*
       * Step 6
       */

      await this.createInventoryTransactions(
        uow,
        invoice.id,
        invoice.invoiceDate,
      );

      /*
       * Step 7
       */

      await uow.purchase.changeStatus(invoice.id, "Confirmed");

      return invoice;
    });
  }
  /* ==========================================================
     CREATE INVENTORY TRANSACTIONS
  ========================================================== */

  private async createInventoryTransactions(
    uow: UnitOfWork,
    invoiceId: number,
    transactionDate: string,
  ) {
    const items = await uow.purchase.getItems(invoiceId);

    if (items.length === 0) {
      return;
    }

    for (const item of items) {
      const lot = await uow.inventory.getLotByPurchaseInvoiceItem(item.id);

      if (!lot) {
        throw new Error(`Inventory lot not found for Purchase Item ${item.id}`);
      }

      await uow.inventory.createTransaction({
        productId: item.productId,

        inventoryLotId: lot.id,

        transactionType: "Purchase",

        quantity: item.quantity,

        referenceTable: "purchase_invoices",

        referenceId: invoiceId,

        transactionDate,

        description: `Purchase Invoice #${invoiceId}`,

        createdAt: new Date().toISOString(),
      });
    }
  }

  /* ==========================================================
     ALLOCATE PURCHASE COSTS
  ========================================================== */

  private async allocateCosts(uow: UnitOfWork, invoiceId: number) {
    const items = await uow.purchase.getItems(invoiceId);

    if (items.length === 0) {
      return;
    }

    const costs = await uow.purchase.getCosts(invoiceId);

    if (costs.length === 0) {
      for (const item of items) {
        await uow.purchase.updateItem(item.id, {
          allocatedCost: 0,
          finalUnitCost: item.unitCost,
        });
      }

      return;
    }

    const totalExtraCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

    const allocatedPerItem = totalExtraCost / items.length;

    for (const item of items) {
      const allocatedPerUnit = allocatedPerItem / item.quantity;

      const finalUnitCost = item.unitCost + allocatedPerUnit;

      await uow.purchase.updateItem(item.id, {
        allocatedCost: allocatedPerItem,
        finalUnitCost,
      });
    }
  }
  /* ==========================================================
     CREATE INVENTORY LOTS
  ========================================================== */

  private async createInventoryLots(
    uow: UnitOfWork,
    invoiceId: number,
    purchaseCurrencyId: number,
    purchaseCurrencyRate: number,
    receivedAt: string,
  ) {
    const items = await uow.purchase.getItems(invoiceId);

    if (items.length === 0) {
      return;
    }

    for (const item of items) {
      await uow.inventory.createLot({
        purchaseInvoiceItemId: item.id,

        productId: item.productId,

        purchaseCurrencyId,

        purchaseCurrencyRate,

        unitCost: item.unitCost,

        allocatedCost: item.allocatedCost,

        finalUnitCost: item.finalUnitCost,

        initialQuantity: item.quantity,

        remainingQuantity: item.quantity,

        receivedAt,

        createdAt: new Date().toISOString(),
      });
    }
  }
}
