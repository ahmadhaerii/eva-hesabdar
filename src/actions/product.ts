import { ipc } from "@/ipc/manager";

export async function getProducts(): Promise<
  Awaited<ReturnType<typeof ipc.client.product.listProducts>>
> {
  return ipc.client.product.listProducts();
}

export function createDummyProduct(): any {
  console.log("createDummyProduct");
  return ipc.client.product.createDummyProduct();
}

// export function searchProducts(keyword: string) {
//   return ipc.client.product.searchProducts({
//     keyword,
//   });
// }
