import { purchaseService } from "@/database/services/purchase.service";
import { salesService } from "@/database/services/sales.service";
import { os } from "@orpc/server";
import { z } from "zod";

//  Purchase
export const listSaleInvoices = os.handler(async () => {
  try {
    const list = await salesService.listSaleInvoices();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});

const createSaleInvoiceInput = z.object({
  invoice: z.object({
    id: z.number().optional(),
    invoiceNumber: z.string(),
    customerId: z.number().min(1, "مشتری الزامی است"),
    totalPrice: z.number().min(1, "جمع الزامی است"),
    currencyRateId: z.number().min(1, "نرخ ارز الزامی است"),
    invoiceDate: z.string().min(1, "تاریخ فاکتور الزامی است"),
    description: z.string().optional().nullable(),
    status: z
      .enum(["Draft", "Confirmed", "Cancelled"])
      .optional()
      .default("Draft"),
    createdAt: z.string(),
    updatedAt: z.string().optional().nullable(),
    deletedAt: z.string().optional().nullable(),
  }),
  items: z
    .array(
      z.object({
        id: z.number().optional(),
        productId: z.number().min(1),
        quantity: z.number().min(1),
        salesInvoiceId: z.number(),
        saleUnitPrice: z.number().min(0),
        suggestedUnitPrice: z.number(),
        lineTotal: z.number().min(0),
        selectedRowOfPurchaseInvoiceItems: z.array(z.number()),
        description: z.string().optional().nullable(),
        createdAt: z.string(),
        updatedAt: z.string().optional().nullable(),
        deletedAt: z.string().optional().nullable(),
      }),
    )
    .min(1),
});
export const createSaleInvoice = os
  .input(createSaleInvoiceInput)
  .handler(async ({ input }) => {
    return salesService.createSaleInvoice(input);
  });

//  remove Below

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
