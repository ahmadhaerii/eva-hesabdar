import {
  NewSalesInvoice,
  NewSalesInvoiceItem,
  SalesInvoiceItemWithRelations,
  SalesInvoiceWithRelations,
} from "../../database/types/database";

import { salesRepository } from "../repositories/sales/sales.repository";
import { inventoryRepository } from "../repositories/inventory/inventory.repository";
import { purchaseRepository } from "../repositories/purchase/purchase.repository";
import { customerService } from "./customer.service";

export interface CreateSalesInvoiceDto {
  invoice: NewSalesInvoice;
  items: NewSalesInvoiceItem[];
  payment: {
    amount: number;
    currencyRateId: number;
    currencyRateAmount: number;
    referenceNumber?: string | undefined | null;
  };
}

export class SalesService {
  constructor() {}

  async listSaleInvoices() {
    const list = await salesRepository.listSaleInvoices();
    return list;
  }

  async getSaleInvoice(id: number) {
    const list = await salesRepository.getSaleInvoice(id);
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
      const data = {
        createdAt: new Date().toISOString(),
        currencyRateId: invoice.currencyRateId,
        currencyRateAmount: dto.payment.currencyRateAmount,
        customerId: invoice.customerId,
        amount: dto.payment.amount,
        adjustmentAmount: 0,
        currencyRateAdjustmentAmount: 0,
        paymentDate: invoice.invoiceDate,
        paymentMethod: "",
        description: `پرداخت وجه به مبلغ ${dto?.payment?.amount?.toLocaleString()} جهت فاکتور شماره ${invoice.id} ثبت شد`,
        referenceNumber: dto.payment.referenceNumber,
      };
      await customerService.createCustomerPayment(data);

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

  async deleteSaleInvoiceItem(data: {
    saleInvoice: SalesInvoiceWithRelations;
    invoiceItem: SalesInvoiceItemWithRelations;
  }) {
    const { saleInvoice, invoiceItem } = data;
    let totalPrice =
      saleInvoice.totalPrice - invoiceItem.lineTotalCurrencyAmount;
    let amountPayable =
      saleInvoice.amountPayable - invoiceItem.lineTotalCurrencyAmount;
    if (saleInvoice.saleInvoiceItems.length === 1) {
      totalPrice = 0;
      amountPayable = 0;
    }
    for await (const allocation of invoiceItem.allocations) {
      const purchaseInvoiceItem =
        await purchaseRepository.getPurchaseInvoiceItemById(
          allocation.purchaseInvoiceItemId,
        );

      await purchaseRepository.updateRemainingQuantity(
        allocation.purchaseInvoiceItemId,
        purchaseInvoiceItem?.remainingQuantity! + allocation.quantity,
      );
      await salesRepository.deleteAllocation(allocation.id);
    }

    await salesRepository.deleteInvoiceItem(invoiceItem.id);

    await salesRepository.updateSaleInvoicePrice(
      saleInvoice.id,
      totalPrice,
      amountPayable,
    );
  }
}
export const salesService = new SalesService();
