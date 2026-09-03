import { db } from "../../database/client";

import { UnitOfWork } from "../../database/unit-of-work";

import {
  NewPurchaseInvoice,
  NewPurchaseInvoiceItem,
} from "../../database/types/database";
import { purchaseRepository } from "../repositories/purchase/purchase.repository";
import { inventoryRepository } from "../repositories/inventory/inventory.repository";

export class PurchaseService {
  constructor() {}
  async listPurchaseInvoices() {
    const list = await purchaseRepository.listPurchaseInvoices();
    return list;
  }
  async createPurchaseInvoice(data: NewPurchaseInvoice) {
    return purchaseRepository.createPurchaseInvoice(data);
  }

  async updatePurchaseInvoice(id: number, data: Partial<NewPurchaseInvoice>) {
    return purchaseRepository.updatePurchaseInvoice(id, data);
  }

  async deletePurchaseInvoice(id: number) {
    return purchaseRepository.deletePurchaseInvoice(id);
  }

  async listPurchaseInvoiceItems(invoiceId: number) {
    const list = await purchaseRepository.listPurchaseInvoiceItems(invoiceId);
    return list;
  }

  async addPurchaseInvoiceItem(data: NewPurchaseInvoiceItem) {
    return purchaseRepository.addPurchaseInvoiceItem(data);
  }

  async updatePurchaseInvoiceItem(
    id: number,
    data: Partial<NewPurchaseInvoiceItem>,
  ) {
    return purchaseRepository.updatePurchaseInvoiceItem(id, data);
  }

  async deletePurchaseInvoiceItem(id: number) {
    return purchaseRepository.deletePurchaseInvoiceItem(id);
  }
}
export const purchaseService = new PurchaseService();
