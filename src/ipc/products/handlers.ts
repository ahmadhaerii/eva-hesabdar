import { productService } from "@/database/services/product.service";
import { os } from "@orpc/server";
import { z } from "zod";

// products
export const listProducts = os.handler(async () => {
  try {
    const list = await productService.list();
    return list;
  } catch (error) {
    console.error("error", error);
  }
});

const createProductInput = z.object({
  name: z.string().min(1),
  categoryId: z.number(),
  unitId: z.number(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
const updateProductInput = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  categoryId: z.number(),
  unitId: z.number(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const deleteProductInput = z.object({
  id: z.number(),
});

export const createProduct = os
  .input(createProductInput)
  .handler(async ({ input }) => {
    console.log("aaaa");

    return productService.createProduct({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    });
  });

export const updateProduct = os
  .input(updateProductInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return productService.updateProduct(id, data);
  });

export const deleteProduct = os
  .input(deleteProductInput)
  .handler(async ({ input }) => {
    return productService.deleteProduct(input.id);
  });

// categories

const createCategoryInput = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
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

export const listCategories = os.handler(async () => {
  return productService.listCategories();
});
export const listCategoriesWithProducts = os.handler(async () => {
  return productService.listCategoriesWithProducts();
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

// units
const createUnitInput = z.object({
  name: z.string().min(1),
  symbol: z.string().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
const updateUnitInput = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  symbol: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const deleteUnitInput = z.object({
  id: z.number(),
});

export const listUnits = os.handler(async () => {
  return productService.listUnits();
});
export const createUnit = os
  .input(createUnitInput)
  .handler(async ({ input }) => {
    return productService.createUnit({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    });
  });

export const updateUnit = os
  .input(updateUnitInput)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return productService.updateUnit(id, data);
  });

export const deleteUnit = os
  .input(deleteUnitInput)
  .handler(async ({ input }) => {
    return productService.deleteUnit(input.id);
  });
