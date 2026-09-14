import { ipc } from "@/ipc/manager";

export async function getSaleInvoices(): Promise<
  Awaited<ReturnType<typeof ipc.client.sale.listSaleInvoices>>
> {
  return ipc.client.sale.listSaleInvoices();
}

export async function createSaleInvoice(data: {
  invoice: {
    invoiceNumber: string;
    customerId: number;
    currencyRateId: number;
    totalPrice: number;
    invoiceDate: string;
    createdAt: string;
    id?: number | undefined;
    description?: string | null | undefined;
    status?: "Draft" | "Confirmed" | "Cancelled" | undefined;
    updatedAt?: string | null | undefined;
    deletedAt?: string | null | undefined;
  };
  items: {
    productId: number;
    quantity: number;
    salesInvoiceId: number;
    saleUnitPrice: number;
    suggestedUnitPrice: number;
    lineTotal: number;
    lineTotalCurrencyAmount: number;
    createdAt: string;
    selectedRowOfPurchaseInvoiceItems: number[];
    id?: number | undefined;
    description?: string | null | undefined;
    updatedAt?: string | null | undefined;
    deletedAt?: string | null | undefined;
  }[];
  payment: {
    amount: number;
    currencyRateAmount: number;
    currencyRateId: number;
    referenceNumber: string | null | undefined;
  };
}): Promise<Awaited<ReturnType<typeof ipc.client.sale.createSaleInvoice>>> {
  console.log("before createSaleInvoice");

  return ipc.client.sale.createSaleInvoice(data);
}

export async function getSaleInvoice(
  id: number,
): Promise<Awaited<ReturnType<typeof ipc.client.sale.getSaleInvoice>>> {
  return ipc.client.sale.getSaleInvoice(id);
}
