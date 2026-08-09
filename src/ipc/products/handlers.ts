import { productService } from "@/database/services/product.service";
import { os } from "@orpc/server";

export const listProducts = os.handler(async () => {
  return productService.list();
});

export const createDummyProduct = os.handler(async ({ input }) => {
  console.log("createDummyProduct1", input);
  return productService.createDummyProduct();
});

// export const searchProducts = os.handler(async ({ input }) => {
//   return productService.search(input.keyword);
// });
