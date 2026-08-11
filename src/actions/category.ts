import { ipc } from "@/ipc/manager";

export async function getCategories(): Promise<
  Awaited<ReturnType<typeof ipc.client.product.listCategories>>
> {
  return ipc.client.product.listCategories();
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
  console.log("updateCategory call");
  return ipc.client.product.updateCategory({
    id,
    ...data,
  });
}
