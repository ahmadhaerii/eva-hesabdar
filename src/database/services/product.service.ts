import {
  NewCategory,
  NewProduct,
  NewUnit,
} from "../../database/types/database";

import { productRepository } from "../repositories/product/product.repository";

export class ProductService {
  async list() {
    const list = await productRepository.list();
    console.log(list);
    return list;
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
    const newCategory: NewCategory = {
      name: "تست",
      createdAt: "",
      isActive: true,
      updatedAt: "",
    };
    const newUnit: NewUnit = {
      symbol: "تست",
      name: "تست",
      createdAt: "",
      isActive: true,
      updatedAt: "",
    };
    // const data1 = await productRepository.createCategory(newCategory);
    // const data2 = await productRepository.createUnit(newUnit);
    // const data = await productRepository.create(newProduct);
    return undefined;
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
