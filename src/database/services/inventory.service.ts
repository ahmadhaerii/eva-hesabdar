import { inventoryRepository } from "../repositories/inventory/inventory.repository";

export class InventoryService {
  constructor() {}

  /* ==========================================================
     PRODUCT STOCK
  ========================================================== */

  async getProductStock(productId: number) {
    return inventoryRepository.getProductStock(productId);
  }

  /* ==========================================================
     AVAILABLE LOTS (FIFO)
  ========================================================== */

  async getAvailableLots(productId: number) {
    return inventoryRepository.getAvailableLots(productId);
  }

  /* ==========================================================
     INVENTORY VALUE
  ========================================================== */

  async getInventoryValue(productId: number) {
    const lots = await inventoryRepository.getAvailableLots(productId);

    return lots.reduce(
      (sum, lot) => sum + lot.remainingQuantity * lot.finalUnitCost,
      0,
    );
  }

  /* ==========================================================
     INVENTORY QUANTITY
  ========================================================== */

  async getInventoryQuantity(productId: number) {
    const lots = await inventoryRepository.getAvailableLots(productId);

    return lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);
  }

  /* ==========================================================
     INVENTORY SUMMARY
  ========================================================== */

  async getSummary(productId: number) {
    const quantity = await this.getInventoryQuantity(productId);

    const value = await this.getInventoryValue(productId);

    return {
      quantity,
      value,
    };
  }

  /* ==========================================================
     LOT HISTORY
  ========================================================== */

  async getLotHistory(productId: number) {
    return inventoryRepository.getLots(productId);
  }

  /* ==========================================================
     TRANSACTION HISTORY
  ========================================================== */

  async getTransactions(productId: number) {
    return inventoryRepository.getTransactions(productId);
  }
}

export const inventoryService = new InventoryService();
