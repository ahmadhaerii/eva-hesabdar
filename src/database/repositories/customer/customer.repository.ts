import { and, asc, eq, isNull, like } from "drizzle-orm";

import { db } from "../../client";

import { contacts, customerProfiles, customerTypes } from "../../schema";

import {
  Contact,
  CustomerProfile,
  CustomerType,
  NewContact,
  NewCustomerProfile,
  NewCustomerType,
} from "../../types/database";
import { BaseRepository } from "../base.repository";

export class CustomerRepository extends BaseRepository {
  /* ==========================================================
     CONTACTS
  ========================================================== */

  async list(): Promise<Contact[]> {
    return this.executor.query.contacts.findMany({
      where: isNull(contacts.deletedAt),

      with: {
        profile: {
          with: {
            customerType: true,
          },
        },
      },

      orderBy: [asc(contacts.displayName)],
    });
  }

  async getById(id: number): Promise<Contact | undefined> {
    return this.executor.query.contacts.findFirst({
      where: and(eq(contacts.id, id), isNull(contacts.deletedAt)),

      with: {
        profile: {
          with: {
            customerType: true,
          },
        },
      },
    });
  }

  async search(keyword: string): Promise<Contact[]> {
    return this.executor.query.contacts.findMany({
      where: and(
        like(contacts.displayName, `%${keyword}%`),
        isNull(contacts.deletedAt),
      ),

      with: {
        profile: {
          with: {
            customerType: true,
          },
        },
      },

      orderBy: [asc(contacts.displayName)],
    });
  }

  async create(data: NewContact) {
    return this.executor.insert(contacts).values(data).returning();
  }

  async update(id: number, data: Partial<NewContact>) {
    return this.executor
      .update(contacts)
      .set(data)
      .where(eq(contacts.id, id))
      .returning();
  }

  async delete(id: number) {
    return db
      .update(contacts)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(contacts.id, id));
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.executor.query.contacts.findFirst({
      columns: {
        id: true,
      },

      where: and(eq(contacts.id, id), isNull(contacts.deletedAt)),
    });

    return result !== undefined;
  }

  /* ==========================================================
     CUSTOMER PROFILE
  ========================================================== */

  async getProfile(contactId: number): Promise<CustomerProfile | undefined> {
    return this.executor.query.customerProfiles.findFirst({
      where: eq(customerProfiles.contactId, contactId),

      with: {
        customerType: true,
      },
    });
  }

  async createProfile(data: NewCustomerProfile) {
    return this.executor.insert(customerProfiles).values(data).returning();
  }

  async updateProfile(contactId: number, data: Partial<NewCustomerProfile>) {
    return db
      .update(customerProfiles)
      .set(data)
      .where(eq(customerProfiles.contactId, contactId))
      .returning();
  }

  /* ==========================================================
     CUSTOMER TYPES
  ========================================================== */

  async listTypes(): Promise<CustomerType[]> {
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

  async createType(data: NewCustomerType) {
    return this.executor.insert(customerTypes).values(data).returning();
  }

  async updateType(id: number, data: Partial<NewCustomerType>) {
    return db
      .update(customerTypes)
      .set(data)
      .where(eq(customerTypes.id, id))
      .returning();
  }

  async deleteType(id: number) {
    return db
      .update(customerTypes)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(customerTypes.id, id));
  }
}

export const customerRepository = new CustomerRepository();
