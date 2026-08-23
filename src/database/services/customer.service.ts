import {
  NewCategory,
  NewCustomerType,
  NewProduct,
  NewUnit,
} from "../../database/types/database";
import { customerRepository } from "../repositories/customer/customer.repository";

import { productRepository } from "../repositories/product/product.repository";

export class CustomerService {
  async list() {
    const list = await customerRepository.list();
    return list;
  }

  // async getById(id: number) {
  //   return productRepository.getById(id);
  // }

  // async search(keyword: string) {
  //   return productRepository.search(keyword);
  // }

  async createProduct(data: NewProduct) {
    return productRepository.createProduct(data);
  }

  async updateProduct(id: number, data: Partial<NewProduct>) {
    return customerRepository.update(id, data);
  }

  async deleteProduct(id: number) {
    return productRepository.deleteProduct(id);
  }

  // customerType

  async listCustomerTypes() {
    return customerRepository.listCustomerType();
  }

  async createCustomerTypes(data: NewCustomerType) {
    return customerRepository.createCustomerType(data);
  }
  async updateCustomerType(
    id: number,
    data: {
      name?: string;
      profitPercent: number;
      description?: string | null;
      isActive?: boolean;
    },
  ) {
    return customerRepository.updateCustomerType(id, data);
  }

  async deleteCustomerType(id: number) {
    return customerRepository.deleteCustomerType(id);
  }
  /////////////////////////////////////////////////////////// remove un used

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

export const customerService = new CustomerService();
