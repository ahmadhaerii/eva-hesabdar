import { ipc } from "@/ipc/manager";

export async function getProducts(): Promise<
  Awaited<ReturnType<typeof ipc.client.product.listProducts>>
> {
  return ipc.client.product.listProducts();
}
export async function inventorySummary(): Promise<
  Awaited<ReturnType<typeof ipc.client.product.inventorySummary>>
> {
  return ipc.client.product.inventorySummary();
}

export async function createProduct(data: {
  name: string;
  categoryId: number;
  unitId: number;
  description?: string | null;
  isActive?: boolean;
}): Promise<Awaited<ReturnType<typeof ipc.client.product.createProduct>>> {
  return ipc.client.product.createProduct(data);
}
export async function updateProduct(
  id: number,
  data: {
    name: string;
    categoryId: number;
    unitId: number;
    description?: string | null;
    isActive?: boolean;
  },
) {
  return ipc.client.product.updateProduct({
    id,
    ...data,
  });
}

export async function deleteProduct(id: number) {
  return ipc.client.product.deleteProduct({
    id,
  });
}
