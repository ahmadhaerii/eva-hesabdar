import { and, asc, eq, isNull, like } from "drizzle-orm";

import { db } from "../../client";

import { customerPayments, customers, customerTypes } from "../../schema";

import {
  CustomerPayment,
  CustomerPaymentWithRelations,
  CustomerType,
  CustomerWithRelations,
  NewCustomer,
  NewCustomerPayment,
  NewCustomerType,
} from "../../types/database";
import { BaseRepository } from "../base.repository";

export class CustomerRepository extends BaseRepository {
  async listCustomers(): Promise<CustomerWithRelations[]> {
    return this.executor.query.customers.findMany({
      where: isNull(customers.deletedAt),
      with: {
        customerType: true,
      },
      orderBy: [asc(customers.displayName)],
    });
  }

  async createCustomer(data: NewCustomer) {
    return this.executor.insert(customers).values(data).returning();
  }

  async updateCustomer(id: number, data: Partial<NewCustomer>) {
    return this.executor
      .update(customers)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(customers.id, id))
      .returning();
  }

  async deleteCustomer(id: number) {
    return db
      .update(customers)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(customers.id, id));
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

  /* ==========================================================
     CUSTOMER TYPES
  ========================================================== */

  async listCustomerPayments(): Promise<CustomerPaymentWithRelations[]> {
    return this.executor.query.customerPayments.findMany({
      where: isNull(customerPayments.deletedAt),
      with: {
        customer: true,
        currencyRate: {
          with: {
            currency: true,
          },
        },
      },
      orderBy: [asc(customerPayments.paymentDate)],
    });
  }

  async createCustomerPayment(data: NewCustomerPayment) {
    return this.executor.insert(customerPayments).values(data).returning();
  }

  async updateCustomerPayment(id: number, data: Partial<NewCustomerPayment>) {
    return db
      .update(customerPayments)
      .set(data)
      .where(eq(customerPayments.id, id))
      .returning();
  }

  async deleteCustomerPayment(id: number) {
    return db
      .update(customerPayments)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(customerPayments.id, id));
  }
}

export const customerRepository = new CustomerRepository();
