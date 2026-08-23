import { and, asc, eq, isNull, like } from "drizzle-orm";

import { db } from "../../client";

import { customers, customerTypes } from "../../schema";

import {
  Customer,
  CustomerType,
  NewCustomer,
  NewCustomerType,
} from "../../types/database";
import { BaseRepository } from "../base.repository";

export class CustomerRepository extends BaseRepository {
  /* ==========================================================
     CONTACTS
  ========================================================== */

  async list(): Promise<Customer[]> {
    return this.executor.query.customers.findMany({
      where: isNull(customers.deletedAt),

      with: {
        customerType: true,
      },

      orderBy: [asc(customers.displayName)],
    });
  }

  async getById(id: number): Promise<Customer | undefined> {
    return this.executor.query.customers.findFirst({
      where: and(eq(customers.id, id), isNull(customers.deletedAt)),

      with: {
        customerType: true,
      },
    });
  }

  async search(keyword: string): Promise<Customer[]> {
    return this.executor.query.customers.findMany({
      where: and(
        like(customers.displayName, `%${keyword}%`),
        isNull(customers.deletedAt),
      ),

      with: {
        customerType: true,
      },

      orderBy: [asc(customers.displayName)],
    });
  }

  async create(data: NewCustomer) {
    return this.executor.insert(customers).values(data).returning();
  }

  async update(id: number, data: Partial<NewCustomer>) {
    return this.executor
      .update(customers)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(customers.id, id))
      .returning();
  }

  async delete(id: number) {
    return db
      .update(customers)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(customers.id, id));
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.executor.query.customers.findFirst({
      columns: {
        id: true,
      },

      where: and(eq(customers.id, id), isNull(customers.deletedAt)),
    });

    return result !== undefined;
  }

  /* ==========================================================
     CUSTOMER TYPES
  ========================================================== */

  async listCustomerType(): Promise<CustomerType[]> {
    return this.executor.query.customerTypes.findMany({
      where: isNull(customerTypes.deletedAt),
      orderBy: [asc(customerTypes.name)],
    });
  }

  async getTypeById(id: number): Promise<CustomerType | undefined> {
    return this.executor.query.customerTypes.findFirst({
      where: and(eq(customerTypes.id, id), isNull(customerTypes.deletedAt)),
    });
  }

  async createCustomerType(data: NewCustomerType) {
    return this.executor.insert(customerTypes).values(data).returning();
  }

  async updateCustomerType(id: number, data: Partial<NewCustomerType>) {
    return db
      .update(customerTypes)
      .set(data)
      .where(eq(customerTypes.id, id))
      .returning();
  }

  async deleteCustomerType(id: number) {
    return db
      .update(customerTypes)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(customerTypes.id, id));
  }
}

export const customerRepository = new CustomerRepository();
