import { productService } from "@/database/services/product.service";
import { os } from "@orpc/server";

export const listProducts = os.handler(async () => {
  try {
    const list = await productService.list();
    console.log("list", list);

    return list;
  } catch (error) {
    console.error("error", error);
  }
});

export const createDummyProduct = os.handler(async ({ input }) => {
  console.log("createDummyProduct1", input);
  return productService.createDummyProduct();
});

// export const searchProducts = os.handler(async ({ input }) => {
//   return productService.search(input.keyword);
// });
