import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
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
export interface CurrencyWithRate extends Currency {
  latestRate: number | null;
  latestRateId: number | null;
}
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

  async listCurrenciesWithLastRate(): Promise<CurrencyWithRate[]> {
    const latestRates = this.executor
      .select({
        currencyId: currencyRates.currencyId,
        rate: currencyRates.rate,
        id: currencyRates.id,
        createdAt: currencyRates.createdAt,
        rowNumber: sql<number>`
        ROW_NUMBER() OVER (
          PARTITION BY ${currencyRates.currencyId}
          ORDER BY ${currencyRates.createdAt} DESC
        )
      `.as("row_number"),
      })
      .from(currencyRates)
      .as("latest_rates");

    const results = await this.executor
      .select({
        id: currencies.id,
        name: currencies.name,
        code: currencies.code,
        isActive: currencies.isActive,
        createdAt: currencies.createdAt,
        updatedAt: currencies.updatedAt,
        deletedAt: currencies.deletedAt,
        isBase: currencies.isBase,
        latestRate: latestRates.rate,
        latestRateId: latestRates.id,
      })
      .from(currencies)
      .leftJoin(
        latestRates,
        and(
          eq(latestRates.currencyId, currencies.id),
          eq(latestRates.rowNumber, sql`1`),
        ),
      )
      .where(
        and(
          eq(currencies.isActive, true),
          eq(currencies.isBase, false),
          isNull(currencies.deletedAt),
        ),
      )
      .orderBy(asc(currencies.name));

    console.log("results", results);
    return results;
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

  async getRatesByCurrency(currencyId: number): Promise<CurrencyRate[]> {
    return this.executor.query.currencyRates.findMany({
      where: eq(currencyRates.currencyId, currencyId),
      orderBy: [desc(currencyRates.createdAt)],
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
