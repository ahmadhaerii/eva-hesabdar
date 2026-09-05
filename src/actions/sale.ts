import { ipc } from "@/ipc/manager";

export async function getPurchaseInvoices(): Promise<
  Awaited<ReturnType<typeof ipc.client.sale.listPurchaseInvoices>>
> {
  return ipc.client.sale.listPurchaseInvoices();
}

export async function createPurchaseInvoice(data: {
  invoiceNumber: string;
  invoiceDate: string;
  currencyId: number;
  currencyRateId: number;
  description?: string | null | undefined;
  status?: "Draft" | "Confirmed" | "Cancelled" | undefined;
}): Promise<Awaited<ReturnType<typeof ipc.client.sale.createPurchaseInvoice>>> {
  return ipc.client.sale.createPurchaseInvoice(data);
}
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
