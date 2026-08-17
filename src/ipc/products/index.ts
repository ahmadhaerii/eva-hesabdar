import {
  createCategory,
  createUnit,
  createProduct,
  deleteCategory,
  deleteUnit,
  deleteProduct,
  listCategories,
  listProducts,
  listUnits,
  updateCategory,
  updateUnit,
  updateProduct,
} from "./handlers";

export const product = {
  listProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createUnit,
  deleteUnit,
  listUnits,
  updateUnit,
};
