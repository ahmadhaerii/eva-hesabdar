import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../client";

import { currencies, currencyRates } from "../../schema";

import {
  Currency,
  CurrencyRate,
  CurrencyRateWithRelations,
  NewCurrency,
  NewCurrencyRate,
} from "../../types/database";
import { BaseRepository } from "../base.repository";

export class CurrencyRepository extends BaseRepository {
  /* ==========================================================
     CURRENCIES
  ========================================================== */

  async listCurrencies(): Promise<Currency[]> {
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
  async createCurrency(data: NewCurrency) {
    return this.executor.insert(currencies).values(data).returning();
  }

  async updateCurrency(id: number, data: Partial<NewCurrency>) {
    return db
      .update(currencies)
      .set(data)
      .where(eq(currencies.id, id))
      .returning();
  }

  async deleteCurrency(id: number) {
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

  async createCurrencyRate(data: NewCurrencyRate) {
    return this.executor.insert(currencyRates).values(data).returning();
  }

  async getRateById(id: number): Promise<CurrencyRate | undefined> {
    return this.executor.query.currencyRates.findFirst({
      where: eq(currencyRates.id, id),
    });
  }

  async getLatestCurrencyRate(
    currencyId: number,
  ): Promise<CurrencyRate | undefined> {
    return this.executor.query.currencyRates.findFirst({
      where: eq(currencyRates.currencyId, currencyId),
      orderBy: [desc(currencyRates.createdAt)],
    });
  }

  async listCurrencyRates(): Promise<CurrencyRateWithRelations[]> {
    return this.executor.query.currencyRates.findMany({
      with: {
        currency: true,
      },
      orderBy: [desc(currencyRates.createdAt)],
    });
  }
}

export const currencyRepository = new CurrencyRepository();
