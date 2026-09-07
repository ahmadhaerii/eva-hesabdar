import {
  NewSalesInvoice,
  NewSalesInvoiceItem,
} from "../../database/types/database";

import { salesRepository } from "../repositories/sales/sales.repository";
import { inventoryRepository } from "../repositories/inventory/inventory.repository";
import { purchaseRepository } from "../repositories/purchase/purchase.repository";

export interface CreateSalesInvoiceDto {
  invoice: NewSalesInvoice;
  items: NewSalesInvoiceItem[];
}

export class SalesService {
  constructor() {}

  async listSaleInvoices() {
    const list = await salesRepository.listSaleInvoices();
    return list;
  }
  async createSaleInvoice(dto: CreateSalesInvoiceDto) {
    try {
      const [invoice] = await salesRepository.createSaleInvoice(dto.invoice);
      console.log("save invoice ", invoice);
      for (const item of dto.items) {
        item.id = undefined;
        const [saleInvoiceItem] = await salesRepository.addSaleInvoiceItem({
          ...item,
          salesInvoiceId: invoice.id,
        });
        await this.allocateInventory(saleInvoiceItem.id, item);
      }
      console.log("saved");
    } catch (error) {
      console.log(error);
    }
  }
  private async allocateInventory(
    saleInvoiceItemId: number,
    item: NewSalesInvoiceItem,
  ) {
    let remainingQuantityForCalculate = item.quantity;

    for (const purchaseInvoiceItemId of item.selectedRowOfPurchaseInvoiceItems) {
      const purchaseInvoiceItem =
        await purchaseRepository.getPurchaseInvoiceItemById(
          purchaseInvoiceItemId,
        );
      remainingQuantityForCalculate =
        remainingQuantityForCalculate - purchaseInvoiceItem!.remainingQuantity;
      let quantity = 0;
      let remainingQuantity = 0;
      if (remainingQuantityForCalculate >= 0) {
        quantity = purchaseInvoiceItem!.remainingQuantity;
        remainingQuantity = 0;
      } else {
        quantity =
          purchaseInvoiceItem!.remainingQuantity +
          remainingQuantityForCalculate;
        remainingQuantity = purchaseInvoiceItem!.remainingQuantity - quantity;
      }

      await salesRepository.createAllocation({
        salesInvoiceItemId: saleInvoiceItemId,
        purchaseInvoiceItemId: purchaseInvoiceItemId,
        quantity: quantity,
        createdAt: new Date().toISOString(),
      });
      await purchaseRepository.updateRemainingQuantity(
        purchaseInvoiceItemId,
        remainingQuantity,
      );
    }
  }
  // remove below

  //   async create(dto: CreateSalesInvoiceDto) {
  //     const [invoice] = await salesRepository.createInvoice(dto.invoice);

  //     for (const item of dto.items) {
  //       await salesRepository.addItem({
  //         ...item,
  //         salesInvoiceId: invoice.id,
  //       });
  //     }

  //     await this.allocateInventory(invoice.id);

  //     await this.createInventoryTransactions(invoice.id, invoice.invoiceDate);

  //     await salesRepository.changeStatus(invoice.id, "Confirmed");

  //     return invoice;
  //   }
  //   /* ==========================================================
  //    CREATE INVENTORY TRANSACTIONS
  // ========================================================== */

  //   private async createInventoryTransactions(
  //     invoiceId: number,
  //     transactionDate: string,
  //   ) {
  //     const items = await salesRepository.getItems(invoiceId);

  //     if (items.length === 0) {
  //       return;
  //     }

  //     for (const item of items) {
  //       const allocations = await salesRepository.getAllocations(item.id);

  //       for (const allocation of allocations) {
  //         await inventoryRepository.createTransaction({
  //           productId: item.productId,

  //           inventoryLotId: allocation.inventoryLotId,

  //           transactionType: "Sale",

  //           quantity: -allocation.quantity,

  //           referenceTable: "sales_invoices",

  //           referenceId: invoiceId,

  //           transactionDate,

  //           description: `Sales Invoice #${invoiceId}`,

  //           createdAt: new Date().toISOString(),
  //         });
  //       }
  //     }
  //   }
  //   /* ==========================================================
  //    ALLOCATE INVENTORY (FIFO)
  // ========================================================== */

  //   private async allocateInventory(invoiceId: number) {
  //     const items = await salesRepository.getItems(invoiceId);

  //     if (items.length === 0) {
  //       return;
  //     }

  //     for (const item of items) {
  //       let remainingQuantity = item.quantity;

  //       const lots = await inventoryRepository.getAvailableLots(item.productId);

  //       if (lots.length === 0) {
  //         throw new Error(`No inventory available for product ${item.productId}`);
  //       }

  //       for (const lot of lots) {
  //         if (remainingQuantity <= 0) {
  //           break;
  //         }

  //         const usedQuantity = Math.min(remainingQuantity, lot.remainingQuantity);

  //         await salesRepository.createAllocation({
  //           salesInvoiceItemId: item.id,

  //           inventoryLotId: lot.id,

  //           quantity: usedQuantity,

  //           fifoUnitCost: lot.finalUnitCost,

  //           fifoTotalCost: usedQuantity * lot.finalUnitCost,

  //           createdAt: new Date().toISOString(),
  //         });

  //         await inventoryRepository.updateRemainingQuantity(
  //           lot.id,
  //           lot.remainingQuantity - usedQuantity,
  //         );

  //         remainingQuantity -= usedQuantity;
  //       }

  //       if (remainingQuantity > 0) {
  //         throw new Error(`Insufficient inventory for product ${item.productId}`);
  //       }
  //     }
  //   }
  //   /* ==========================================================
  //    GET INVOICE
  // ========================================================== */

  //   async getById(id: number) {
  //     return salesRepository.getById(id);
  //   }
  //   /* ==========================================================
  //    LIST
  // ========================================================== */

  //   async list() {
  //     return salesRepository.list();
  //   }
  //   /* ==========================================================
  //    CONFIRM
  // ========================================================== */

  //   async confirm(invoiceId: number) {
  //     return salesRepository.changeStatus(invoiceId, "Confirmed");
  //   }
  //   /* ==========================================================
  //    CANCEL
  // ========================================================== */

  //   async cancel(invoiceId: number) {
  //     return salesRepository.changeStatus(invoiceId, "Cancelled");
  //   }
  //   /* ==========================================================
  //    DELETE
  // ========================================================== */

  //   async delete(invoiceId: number) {
  //     return salesRepository.delete(invoiceId);
  //   }
}
export const salesService = new SalesService();
