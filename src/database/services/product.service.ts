import {
  NewCategory,
  NewProduct,
  NewUnit,
} from "../../database/types/database";

import { productRepository } from "../repositories/product/product.repository";

export class ProductService {
  async list() {
    const list = await productRepository.list();
    return list;
  }

  // async getById(id: number) {
  //   return productRepository.getById(id);
  // }

  // async search(keyword: string) {
  //   return productRepository.search(keyword);
  // }

  async createProduct(data: NewProduct) {
    console.log("createProduct");
    return productRepository.createProduct(data);
  }

  async updateProduct(id: number, data: Partial<NewProduct>) {
    return productRepository.updateProduct(id, data);
  }

  async deleteProduct(id: number) {
    return productRepository.deleteProduct(id);
  }

  // categories

  async listCategories() {
    return productRepository.listCategories();
  }

  async createCategory(data: NewCategory) {
    return productRepository.createCategory(data);
  }
  async updateCategory(
    id: number,
    data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    },
  ) {
    return productRepository.updateCategory(id, data);
  }

  async deleteCategory(id: number) {
    return productRepository.deleteCategory(id);
  }

  // units
  async listUnits() {
    return productRepository.listUnits();
  }

  async createUnit(data: NewUnit) {
    return productRepository.createUnit(data);
  }
  async updateUnit(
    id: number,
    data: {
      name?: string;
      symbol?: string;
      description?: string | null;
      isActive?: boolean;
    },
  ) {
    return productRepository.updateUnit(id, data);
  }

  async deleteUnit(id: number) {
    return productRepository.deleteUnit(id);
  }
}

export const productService = new ProductService();
