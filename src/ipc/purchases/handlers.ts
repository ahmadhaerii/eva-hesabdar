import { customerService } from "@/database/services/customer.service";
import { purchaseService } from "@/database/services/purchase.service";
import { os } from "@orpc/server";
import { z } from "zod";

//  Purchase
export const listPurchaseInvoices = os.handler(async () => {
  try {
    const list = await purchaseService.listPurchaseInvoices();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});

const createPurchaseInvoiceInput = z.object({
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  currencyId: z.number().min(1),
  currencyRateId: z.number().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(["Draft", "Confirmed", "Cancelled"]).optional(),
});
const updatePurchaseInvoiceInput = z.object({
  id: z.number(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  currencyId: z.number().min(1),
  currencyRateId: z.number().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(["Draft", "Confirmed", "Cancelled"]).optional(),
});

const deletePurchaseInvoiceInput = z.object({
  id: z.number(),
});

const idInput = z.number();

export const createPurchaseInvoice = os
  .input(createPurchaseInvoiceInput)
  .handler(async ({ input }) => {
    return purchaseService.createPurchaseInvoice({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    });
  });

export const updatePurchaseInvoice = os
  .input(updatePurchaseInvoiceInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return purchaseService.updatePurchaseInvoice(id, data);
  });

export const deletePurchaseInvoice = os
  .input(deletePurchaseInvoiceInput)
  .handler(async ({ input }) => {
    return purchaseService.deletePurchaseInvoice(input.id);
  });

// Purchase Invoice Item

const addPurchaseInvoiceItemInput = z.object({
  purchaseInvoiceId: z.number().min(1),
  productId: z.number().min(1),
  quantity: z.number().min(1),
  remainingQuantity: z.number().min(1),
  freightShare: z.number().min(1),
  unitPrice: z.number().min(1),
  totalPrice: z.number().min(1),
  description: z.string().nullable().optional(),
});
const updatePurchaseInvoiceItemInput = z.object({
  id: z.number(),
  purchaseInvoiceId: z.number().min(1),
  productId: z.number().min(1),
  quantity: z.number().min(1),
  remainingQuantity: z.number().min(1),
  freightShare: z.number().min(1),
  unitPrice: z.number().min(1),
  totalPrice: z.number().min(1),
  description: z.string().nullable().optional(),
});

const deletePurchaseInvoiceItemInput = z.object({
  id: z.number(),
});

export const listPurchaseInvoiceItems = os
  .input(idInput)
  .handler(async ({ input }) => {
    return purchaseService.listPurchaseInvoiceItems(input);
  });

export const addPurchaseInvoiceItem = os
  .input(addPurchaseInvoiceItemInput)
  .handler(async ({ input }) => {
    return purchaseService.addPurchaseInvoiceItem(input);
  });

export const updatePurchaseInvoiceItem = os
  .input(updatePurchaseInvoiceItemInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return purchaseService.updatePurchaseInvoiceItem(id, data);
  });

export const deletePurchaseInvoiceItem = os
  .input(deletePurchaseInvoiceItemInput)
  .handler(async ({ input }) => {
    return purchaseService.deletePurchaseInvoiceItem(input.id);
  });
