import { inventoryRepository } from "../../database/repositories/inventory/inventory.repository";

export interface FifoResult {
  fifoUnitCost: number;
  totalCost: number;

  allocations: {
    inventoryLotId: number;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
}

export class PricingService {
  /* ==========================================================
     FIFO COST
  ========================================================== */

  async calculateFifoCost(
    productId: number,
    quantity: number,
  ): Promise<FifoResult> {
    const lots = await inventoryRepository.getAvailableLots(productId);

    let remaining = quantity;

    let totalCost = 0;

    const allocations: FifoResult["allocations"] = [];

    for (const lot of lots) {
      if (remaining <= 0) break;

      const used = Math.min(remaining, lot.remainingQuantity);

      const cost = used * lot.finalUnitCost;

      allocations.push({
        inventoryLotId: lot.id,
        quantity: used,
        unitCost: lot.finalUnitCost,
        totalCost: cost,
      });

      totalCost += cost;

      remaining -= used;
    }

    if (remaining > 0) {
      throw new Error("Insufficient inventory.");
    }

    return {
      fifoUnitCost: totalCost / quantity,
      totalCost,
      allocations,
    };
  }

  /* ==========================================================
     CUSTOMER PROFIT
  ========================================================== */

  calculateProfit(cost: number, percent: number) {
    return cost * (percent / 100);
  }

  /* ==========================================================
     SUGGESTED SALE PRICE
  ========================================================== */

  calculateSuggestedPrice(cost: number, profitPercent: number) {
    return cost + this.calculateProfit(cost, profitPercent);
  }

  /* ==========================================================
     LINE TOTAL
  ========================================================== */

  calculateLineTotal(quantity: number, unitPrice: number) {
    return quantity * unitPrice;
  }
}

export const pricingService = new PricingService();
