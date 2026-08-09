import {
  NewCategory,
  NewProduct,
  NewUnit,
} from "../../database/types/database";

import { productRepository } from "../repositories/product/product.repository";

export class ProductService {
  async list() {
    return productRepository.list();
  }

  async getById(id: number) {
    return productRepository.getById(id);
  }

  async search(keyword: string) {
    return productRepository.search(keyword);
  }

  async create(data: NewProduct) {
    return productRepository.create(data);
  }
  async createDummyProduct() {
    const newProduct: NewProduct = {
      name: "",
      createdAt: "",
      unitId: 1,
      isActive: true,
      updatedAt: "",
      categoryId: 1,
    };
    const data = productRepository.create(newProduct);
    console.log("data : => ", data);
    return data;
  }

  async update(id: number, data: Partial<NewProduct>) {
    return productRepository.update(id, data);
  }

  async delete(id: number) {
    return productRepository.delete(id);
  }

  async listCategories() {
    return productRepository.listCategories();
  }

  async createCategory(data: NewCategory) {
    return productRepository.createCategory(data);
  }

  async listUnits() {
    return productRepository.listUnits();
  }

  async createUnit(data: NewUnit) {
    return productRepository.createUnit(data);
  }
}

export const productService = new ProductService();
