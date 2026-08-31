import { NewCustomer, NewCustomerType } from "../../database/types/database";
import { customerRepository } from "../repositories/customer/customer.repository";

export class CustomerService {
  async listCustomers() {
    const list = await customerRepository.listCustomers();
    return list;
  }
  async createCustomer(data: NewCustomer) {
    return customerRepository.createCustomer(data);
  }

  async updateCustomer(id: number, data: Partial<NewCustomer>) {
    return customerRepository.updateCustomer(id, data);
  }

  async deleteCustomer(id: number) {
    return customerRepository.deleteCustomer(id);
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
}

export const customerService = new CustomerService();
