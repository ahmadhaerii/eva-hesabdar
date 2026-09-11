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

//  remove below
export async function updatePurchaseInvoice(
  id: number,
  data: {
    invoiceNumber: string;
    invoiceDate: string;
    currencyId: number;
    currencyRateId: number;
    description?: string | null | undefined;
    status?: "Draft" | "Confirmed" | "Cancelled" | undefined;
  },
) {
  return ipc.client.sale.updatePurchaseInvoice({
    id,
    ...data,
  });
}

export async function deletePurchaseInvoice(id: number) {
  return ipc.client.sale.deletePurchaseInvoice({
    id,
  });
}

export async function getPurchaseInvoiceItems(
  id: number,
): Promise<
  Awaited<ReturnType<typeof ipc.client.sale.listPurchaseInvoiceItems>>
> {
  return ipc.client.sale.listPurchaseInvoiceItems(id);
}

export async function addPurchaseInvoiceItem(data: {
  purchaseInvoiceId: number;
  productId: number;
  quantity: number;
  remainingQuantity: number;
  freightShare: number;
  unitPrice: number;
  totalPrice: number;
  description?: string | null | undefined;
}): Promise<
  Awaited<ReturnType<typeof ipc.client.sale.addPurchaseInvoiceItem>>
> {
  return ipc.client.sale.addPurchaseInvoiceItem(data);
}

export async function updatePurchaseInvoiceItem(
  id: number,
  data: {
    purchaseInvoiceId: number;
    productId: number;
    quantity: number;
    remainingQuantity: number;
    freightShare: number;
    unitPrice: number;
    totalPrice: number;
    description?: string | null | undefined;
  },
) {
  return ipc.client.sale.updatePurchaseInvoiceItem({
    id,
    ...data,
  });
}

export async function deletePurchaseInvoiceItem(id: number) {
  return ipc.client.sale.deletePurchaseInvoiceItem({
    id,
  });
}
