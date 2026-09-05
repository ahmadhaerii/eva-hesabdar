import { ipc } from "@/ipc/manager";

export async function getPurchaseInvoices(): Promise<
  Awaited<ReturnType<typeof ipc.client.purchase.listPurchaseInvoices>>
> {
  return ipc.client.purchase.listPurchaseInvoices();
}

export async function createPurchaseInvoice(data: {
  invoiceNumber: string;
  invoiceDate: string;
  currencyId: number;
  currencyRateId: number;
  description?: string | null | undefined;
  status?: "Draft" | "Confirmed" | "Cancelled" | undefined;
}): Promise<
  Awaited<ReturnType<typeof ipc.client.purchase.createPurchaseInvoice>>
> {
  return ipc.client.purchase.createPurchaseInvoice(data);
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
  return ipc.client.purchase.updatePurchaseInvoice({
    id,
    ...data,
  });
}

export async function deletePurchaseInvoice(id: number) {
  return ipc.client.purchase.deletePurchaseInvoice({
    id,
  });
}

export async function getPurchaseInvoiceItems(
  id: number,
): Promise<
  Awaited<ReturnType<typeof ipc.client.purchase.listPurchaseInvoiceItems>>
> {
  return ipc.client.purchase.listPurchaseInvoiceItems(id);
}

export async function getPurchaseInvoiceItemsForProduct(
  id: number,
): Promise<
  Awaited<
    ReturnType<typeof ipc.client.purchase.listPurchaseInvoiceItemsForProduct>
  >
> {
  return ipc.client.purchase.listPurchaseInvoiceItemsForProduct(id);
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
  Awaited<ReturnType<typeof ipc.client.purchase.addPurchaseInvoiceItem>>
> {
  return ipc.client.purchase.addPurchaseInvoiceItem(data);
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
  return ipc.client.purchase.updatePurchaseInvoiceItem({
    id,
    ...data,
  });
}

export async function deletePurchaseInvoiceItem(id: number) {
  return ipc.client.purchase.deletePurchaseInvoiceItem({
    id,
  });
}
