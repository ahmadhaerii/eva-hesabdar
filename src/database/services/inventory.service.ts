import { inventoryRepository } from "../../database/repositories/inventory/inventory.repository";

import {
  NewInventoryLot,
  NewInventoryTransaction,
} from "../../database/types/database";

export class InventoryService {
  /* ==========================================================
     LOT
  ========================================================== */

  async createLot(data: NewInventoryLot) {
    const [lot] = await inventoryRepository.createLot(data);

    return lot;
  }

  async updateRemainingQuantity(lotId: number, remainingQuantity: number) {
    return inventoryRepository.updateLot(lotId, {
      remainingQuantity,
    });
  }

  async getAvailableLots(productId: number) {
    return inventoryRepository.getAvailableLots(productId);
  }

  async getCurrentStock(productId: number) {
    return inventoryRepository.getCurrentStock(productId);
  }

  /* ==========================================================
     TRANSACTIONS
  ========================================================== */

  async createTransaction(data: NewInventoryTransaction) {
    const [tx] = await inventoryRepository.createTransaction(data);

    return tx;
  }
  async getLotByPurchaseInvoiceItem(purchaseInvoiceItemId: number) {
    return inventoryRepository.getLotsByPurchaseInvoiceItem(
      purchaseInvoiceItemId,
    );
  }
}

export const inventoryService = new InventoryService();
