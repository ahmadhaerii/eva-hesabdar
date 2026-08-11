import {
  createCategory,
  createDummyProduct,
  deleteCategory,
  listCategories,
  listProducts,
  updateCategory,
} from "./handlers";

export const product = {
  listProducts,
  createDummyProduct,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
