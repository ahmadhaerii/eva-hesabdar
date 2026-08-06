// src/services/price-calculator.service.ts

export interface FreightAllocationInput {
  totalFreight: number;
  itemCount: number;
}

export interface SuggestedPriceInput {
  unitCost: number; // قیمت خرید واحد (به ارز خرید)
  allocatedFreight: number; // سهم کرایه (به ارز خرید)
  currencyRate: number; // نرخ امروز ارز خرید به ریال
  profitPercent: number; // درصد سود مشتری
}

export const PriceCalculatorService = {
  /**
   * کرایه رو به‌صورت مساوی بین ردیف‌های فاکتور تقسیم می‌کنه.
   * مثال: کرایه ۱۰۰ و ۴ ردیف => هر ردیف ۲۵.
   */
  allocateFreightEqually({
    totalFreight,
    itemCount,
  }: FreightAllocationInput): number {
    if (itemCount <= 0) return 0;
    return totalFreight / itemCount;
  },

  /**
   * Final Cost = Purchase Price + Allocated Freight
   */
  calculateFinalUnitCost(unitCost: number, allocatedFreight: number): number {
    return unitCost + allocatedFreight;
  },

  /**
   * Suggested Price = Final Cost × Today's Rate × (1 + Profit%)
   */
  calculateSuggestedPrice({
    unitCost,
    allocatedFreight,
    currencyRate,
    profitPercent,
  }: SuggestedPriceInput): number {
    const finalCost = this.calculateFinalUnitCost(unitCost, allocatedFreight);
    const costInIRR = finalCost * currencyRate;
    return costInIRR * (1 + profitPercent / 100);
  },

  /**
   * برای هشدار به کاربر وقتی قیمت واقعی خیلی با پیشنهادی فرق داره.
   * فقط هشدار می‌ده، هرگز جلوی فروش رو نمی‌گیره (طبق Rule 10).
   */
  calculatePriceDifference(suggestedPrice: number, actualPrice: number) {
    const difference = actualPrice - suggestedPrice;
    const percentDifference =
      suggestedPrice === 0 ? 0 : (difference / suggestedPrice) * 100;
    return { difference, percentDifference };
  },
};
