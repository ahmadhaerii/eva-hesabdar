import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../client";

import { currencies, currencyRates } from "../../schema";

import {
  Currency,
  CurrencyRate,
  NewCurrency,
  NewCurrencyRate,
} from "../../types/database";
import { BaseRepository } from "../base.repository";

export class CurrencyRepository extends BaseRepository {
  /* ==========================================================
     CURRENCIES
  ========================================================== */

  async list(): Promise<Currency[]> {
    return this.executor.query.currencies.findMany({
      where: isNull(currencies.deletedAt),
      orderBy: [asc(currencies.name)],
    });
  }

  async listActive(): Promise<Currency[]> {
    return this.executor.query.currencies.findMany({
      where: and(eq(currencies.isActive, true), isNull(currencies.deletedAt)),
      orderBy: [asc(currencies.name)],
    });
  }

  async getById(id: number): Promise<Currency | undefined> {
    return this.executor.query.currencies.findFirst({
      where: and(eq(currencies.id, id), isNull(currencies.deletedAt)),
    });
  }

  async getBaseCurrency(): Promise<Currency | undefined> {
    return this.executor.query.currencies.findFirst({
      where: and(eq(currencies.isBase, true), isNull(currencies.deletedAt)),
    });
  }
  async create(data: NewCurrency) {
    return this.executor.insert(currencies).values(data).returning();
  }

  async update(id: number, data: Partial<NewCurrency>) {
    return db
      .update(currencies)
      .set(data)
      .where(eq(currencies.id, id))
      .returning();
  }

  async delete(id: number) {
    return db
      .update(currencies)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(currencies.id, id));
  }

  /* ==========================================================
     CURRENCY RATES
  ========================================================== */

  async createRate(data: NewCurrencyRate) {
    return this.executor.insert(currencyRates).values(data).returning();
  }

  async getRateById(id: number): Promise<CurrencyRate | undefined> {
    return this.executor.query.currencyRates.findFirst({
      where: eq(currencyRates.id, id),
    });
  }

  async getLatestRate(currencyId: number): Promise<CurrencyRate | undefined> {
    return this.executor.query.currencyRates.findFirst({
      where: eq(currencyRates.currencyId, currencyId),
      orderBy: [desc(currencyRates.createdAt)],
    });
  }

  async listRates(currencyId: number): Promise<CurrencyRate[]> {
    return this.executor.query.currencyRates.findMany({
      where: eq(currencyRates.currencyId, currencyId),
      orderBy: [desc(currencyRates.createdAt)],
    });
  }

  async deleteRate(id: number) {
    return this.executor.delete(currencyRates).where(eq(currencyRates.id, id));
  }
}

export const currencyRepository = new CurrencyRepository();
