import { db } from "../../database/client";

import { UnitOfWork } from "../../database/unit-of-work";

import {
  NewPurchaseCost,
  NewPurchaseInvoice,
  NewPurchaseInvoiceItem,
} from "../../database/types/database";
import { purchaseRepository } from "../repositories/purchase/purchase.repository";
import { inventoryRepository } from "../repositories/inventory/inventory.repository";

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
    const [invoice] = await purchaseRepository.createInvoice(dto.invoice);

    for (const item of dto.items) {
      await purchaseRepository.addItem({
        ...item,
        purchaseInvoiceId: invoice.id,
      });
    }

    for (const cost of dto.costs) {
      await purchaseRepository.addCost({
        ...cost,
        purchaseInvoiceId: invoice.id,
      });
    }

    await this.allocateCosts(invoice.id);

    await this.createInventoryLots(
      invoice.id,
      invoice.currencyId,
      invoice.currencyRate,
      invoice.invoiceDate,
    );

    await this.createInventoryTransactions(invoice.id, invoice.invoiceDate);

    await purchaseRepository.changeStatus(invoice.id, "Confirmed");

    return invoice;
  }

  /* ==========================================================
     ALLOCATE PURCHASE COSTS
  ========================================================== */

  private async allocateCosts(invoiceId: number) {
    const items = await purchaseRepository.getItems(invoiceId);

    if (items.length === 0) {
      return;
    }

    const costs = await purchaseRepository.getCosts(invoiceId);

    if (costs.length === 0) {
      for (const item of items) {
        await purchaseRepository.updateItem(item.id, {
          allocatedCost: 0,
          finalUnitCost: item.unitCost,
        });
      }

      return;
    }

    const totalExtraCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

    const allocatedPerItem = totalExtraCost / items.length;

    for (const item of items) {
      const allocatedPerUnit =
        item.quantity > 0 ? allocatedPerItem / item.quantity : 0;

      await purchaseRepository.updateItem(item.id, {
        allocatedCost: allocatedPerItem,
        finalUnitCost: item.unitCost + allocatedPerUnit,
      });
    }
  }
  /* ==========================================================
     CREATE INVENTORY LOTS
  ========================================================== */

  private async createInventoryLots(
    invoiceId: number,
    purchaseCurrencyId: number,
    purchaseCurrencyRate: number,
    receivedAt: string,
  ) {
    const items = await purchaseRepository.getItems(invoiceId);

    if (items.length === 0) {
      return;
    }

    for (const item of items) {
      await inventoryRepository.createLot({
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
  /* ==========================================================
     CREATE INVENTORY TRANSACTIONS
  ========================================================== */

  private async createInventoryTransactions(
    invoiceId: number,
    transactionDate: string,
  ) {
    const items = await purchaseRepository.getItems(invoiceId);

    if (items.length === 0) {
      return;
    }

    for (const item of items) {
      const lot = await inventoryRepository.getLotByPurchaseInvoiceItem(
        item.id,
      );

      if (!lot) {
        throw new Error(`Inventory lot not found for Purchase Item ${item.id}`);
      }

      await inventoryRepository.createTransaction({
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
}
