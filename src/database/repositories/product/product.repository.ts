import { and, asc, eq, isNull, like, sql } from "drizzle-orm";
import {
  categories,
  products,
  purchaseInvoiceItems,
  units,
} from "../../schema";

import {
  Category,
  CategoryWithRelations,
  InventorySummary,
  NewCategory,
  NewProduct,
  NewUnit,
  Product,
  ProductWithRelations,
  Unit,
} from "../../types/database";
import { BaseRepository } from "../base.repository";

export class ProductRepository extends BaseRepository {
  /* ==========================================================
     PRODUCTS
  ========================================================== */

  async list(): Promise<ProductWithRelations[]> {
    return this.executor.query.products.findMany({
      where: isNull(products.deletedAt),
      with: {
        category: true,
        unit: true,
      },
      orderBy: [asc(products.name)],
    });
  }

  async inventorySummary(): Promise<InventorySummary[]> {
    const rows = await this.executor
      .select({
        productId: products.id,
        productName: products.name,
        totalPurchased: sql<number>`COALESCE(SUM(${purchaseInvoiceItems.quantity}), 0)`,
        totalRemaining: sql<number>`COALESCE(SUM(${purchaseInvoiceItems.remainingQuantity}), 0)`,
        totalSoldOrUsed: sql<number>`COALESCE(SUM(${purchaseInvoiceItems.quantity} - ${purchaseInvoiceItems.remainingQuantity}), 0)`,
      })
      .from(products)
      .leftJoin(
        purchaseInvoiceItems,
        eq(purchaseInvoiceItems.productId, products.id),
      )
      .groupBy(products.id)
      .where(eq(products.isActive, true))
      .orderBy(products.name);

    return rows;
  }
  async inventorySummaryLessThan(): Promise<InventorySummary[]> {
    const rows = await this.executor
      .select({
        productId: products.id,
        productName: products.name,
        totalPurchased: sql<number>`COALESCE(SUM(${purchaseInvoiceItems.quantity}), 0)`,
        totalRemaining: sql<number>`COALESCE(SUM(${purchaseInvoiceItems.remainingQuantity}), 0)`,
        totalSoldOrUsed: sql<number>`COALESCE(SUM(${purchaseInvoiceItems.quantity} - ${purchaseInvoiceItems.remainingQuantity}), 0)`,
      })
      .from(products)
      .leftJoin(
        purchaseInvoiceItems,
        eq(purchaseInvoiceItems.productId, products.id),
      )
      .groupBy(products.id)
      .having(
        sql`COALESCE(SUM(${purchaseInvoiceItems.remainingQuantity}), 0) < 3`,
      )
      .where(eq(products.isActive, true))
      .orderBy(purchaseInvoiceItems.remainingQuantity);

    return rows;
  }

  async getById(id: number): Promise<Product | undefined> {
    return this.executor.query.products.findFirst({
      where: and(eq(products.id, id), isNull(products.deletedAt)),

      with: {
        category: true,
        unit: true,
      },
    });
  }

  async search(keyword: string): Promise<Product[]> {
    return this.executor.query.products.findMany({
      where: and(
        like(products.name, `%${keyword}%`),
        isNull(products.deletedAt),
      ),

      with: {
        category: true,
        unit: true,
      },

      orderBy: [asc(products.name)],
    });
  }

  async createProduct(data: NewProduct) {
    return await this.executor.insert(products).values(data).returning();
  }

  async updateProduct(id: number, data: Partial<NewProduct>) {
    return this.executor
      .update(products)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id))
      .returning();
  }

  async deleteProduct(id: number) {
    return this.executor
      .update(products)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id));
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.executor.query.products.findFirst({
      columns: {
        id: true,
      },

      where: and(eq(products.id, id), isNull(products.deletedAt)),
    });

    return result !== undefined;
  }

  /* ==========================================================
     CATEGORIES
  ========================================================== */

  async listCategories(): Promise<Category[]> {
    return this.executor.query.categories.findMany({
      where: isNull(categories.deletedAt),
      orderBy: [asc(categories.name)],
    });
  }

  async listCategoriesWithProducts(): Promise<CategoryWithRelations[]> {
    return this.executor.query.categories.findMany({
      where: isNull(categories.deletedAt),
      with: {
        products: true,
      },
      orderBy: [asc(categories.name)],
    });
  }

  async updateCategory(id: number, data: Partial<NewCategory>) {
    return this.executor
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(categories.id, id))
      .returning();
  }

  async deleteCategory(id: number) {
    return this.executor
      .update(categories)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(categories.id, id));
  }
  async createCategory(data: NewCategory) {
    return this.executor.insert(categories).values(data).returning();
  }

  /* ==========================================================
     UNITS
  ========================================================== */

  async listUnits(): Promise<Unit[]> {
    return this.executor.query.units.findMany({
      where: isNull(units.deletedAt),
      orderBy: [asc(units.name)],
    });
  }

  async createUnit(data: NewUnit) {
    return this.executor.insert(units).values(data).returning();
  }
  async updateUnit(id: number, data: Partial<NewCategory>) {
    return this.executor
      .update(units)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(units.id, id))
      .returning();
  }

  async deleteUnit(id: number) {
    return this.executor
      .update(units)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(eq(units.id, id));
  }
}

export const productRepository = new ProductRepository();
