import { inventoryRepository } from "../repositories/inventory/inventory.repository";

export interface CalculatePriceDto {
  productId: number;

  exchangeRate: number;

  profitPercent: number;

  quantity?: number;
}

export class PricingService {
  constructor() {}

  /* ==========================================================
     FIFO COST
  ========================================================== */

  async getFifoCost(productId: number): Promise<number> {
    const lots = await inventoryRepository.getAvailableLots(productId);

    if (lots.length === 0) {
      return 0;
    }

    return lots[0].finalUnitCost;
  }

  /* ==========================================================
     SUGGESTED PRICE
  ========================================================== */

  async calculatePrice(dto: CalculatePriceDto) {
    const fifoCost = await this.getFifoCost(dto.productId);

    const basePrice = fifoCost * dto.exchangeRate;

    const profit = basePrice * (dto.profitPercent / 100);

    return {
      fifoCost,

      exchangeRate: dto.exchangeRate,

      basePrice,

      profit,

      suggestedPrice: basePrice + profit,
    };
  }

  /* ==========================================================
     LINE TOTAL
  ========================================================== */

  calculateLineTotal(quantity: number, unitPrice: number) {
    return quantity * unitPrice;
  }

  /* ==========================================================
     INVOICE TOTAL
  ========================================================== */

  calculateInvoiceTotal(
    lines: {
      quantity: number;
      unitPrice: number;
    }[],
  ) {
    return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  }

  /* ==========================================================
     PROFIT AMOUNT
  ========================================================== */

  calculateProfit(cost: number, salePrice: number) {
    return salePrice - cost;
  }

  /* ==========================================================
     PROFIT PERCENT
  ========================================================== */

  calculateProfitPercent(cost: number, salePrice: number) {
    if (cost === 0) {
      return 0;
    }

    return ((salePrice - cost) / cost) * 100;
  }
}

export const pricingService = new PricingService();
