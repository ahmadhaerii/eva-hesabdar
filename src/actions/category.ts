import { ipc } from "@/ipc/manager";

export async function getCategories(): Promise<
  Awaited<ReturnType<typeof ipc.client.product.listCategories>>
> {
  return ipc.client.product.listCategories();
}
export async function getCategoriesWithProducts(): Promise<
  Awaited<ReturnType<typeof ipc.client.product.listCategoriesWithProducts>>
> {
  return ipc.client.product.listCategoriesWithProducts();
}
export async function createCategory(data: {
  name: string;
  description?: string | null;
  isActive?: boolean;
}): Promise<Awaited<ReturnType<typeof ipc.client.product.createCategory>>> {
  return ipc.client.product.createCategory(data);
}
export async function updateCategory(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    isActive?: boolean;
  },
) {
  return ipc.client.product.updateCategory({
    id,
    ...data,
  });
}

export async function deleteCategory(id: number) {
  return ipc.client.product.deleteCategory({
    id,
  });
}
