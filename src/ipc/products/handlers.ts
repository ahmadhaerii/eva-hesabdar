import { productService } from "@/database/services/product.service";
import { os } from "@orpc/server";
import { z } from "zod";

const createCategoryInput = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

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

export const listCategories = os.handler(async () => {
  return productService.listCategories();
});

export const createCategory = os
  .input(createCategoryInput)
  .handler(async ({ input }) => {
    return productService.createCategory({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    });
  });
const updateCategoryInput = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const deleteCategoryInput = z.object({
  id: z.number(),
});
export const updateCategory = os
  .input(updateCategoryInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return productService.updateCategory(id, data);
  });

export const deleteCategory = os
  .input(deleteCategoryInput)
  .handler(async ({ input }) => {
    return productService.deleteCategory(input.id);
  });
// export const searchProducts = os.handler(async ({ input }) => {
//   return productService.search(input.keyword);
// });
