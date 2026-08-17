import { ipc } from "@/ipc/manager";

export async function getUnits(): Promise<
  Awaited<ReturnType<typeof ipc.client.product.listUnits>>
> {
  return ipc.client.product.listUnits();
}
export async function createUnit(data: {
  name: string;
  symbol: string;
  description?: string | null;
  isActive?: boolean;
}): Promise<Awaited<ReturnType<typeof ipc.client.product.createUnit>>> {
  return ipc.client.product.createUnit(data);
}

export async function updateUnit(
  id: number,
  data: {
    name?: string;
    symbol?: string;
    description?: string | null;
    isActive?: boolean;
  },
) {
  return ipc.client.product.updateUnit({
    id,
    ...data,
  });
}

export async function deleteUnit(id: number) {
  return ipc.client.product.deleteUnit({
    id,
  });
}
