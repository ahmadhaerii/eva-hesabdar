import { purchaseService } from "@/database/services/purchase.service";
import { salesService } from "@/database/services/sales.service";
import { os } from "@orpc/server";
import { z } from "zod";

export const listSaleInvoices = os.handler(async () => {
  try {
    const list = await salesService.listSaleInvoices();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});
const idInput = z.number();

export const getSaleInvoice = os.input(idInput).handler(async ({ input }) => {
  try {
    const list = await salesService.getSaleInvoice(input);
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
    discount: z.number().min(1, "  الزامی است"),
    amountPayable: z.number().min(1, "  الزامی است"),
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
        lineTotalCurrencyAmount: z.number().min(0),
        selectedRowOfPurchaseInvoiceItems: z.array(z.number()),
        description: z.string().optional().nullable(),
        createdAt: z.string(),
        updatedAt: z.string().optional().nullable(),
        deletedAt: z.string().optional().nullable(),
      }),
    )
    .min(1),
  payment: z.object({
    referenceNumber: z.string().optional().nullable(),
    amount: z.number(),
    currencyRateId: z.number().min(1, "  الزامی است"),
    currencyRateAmount: z.number(),
  }),
});
export const createSaleInvoice = os
  .input(createSaleInvoiceInput)
  .handler(async ({ input }) => {
    return salesService.createSaleInvoice(input);
  });
