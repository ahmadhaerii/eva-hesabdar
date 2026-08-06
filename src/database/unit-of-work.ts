import { db } from "./client";

import { CurrencyRepository } from "./repositories/currency/currency.repository";
import { CustomerRepository } from "./repositories/customer/customer.repository";
import { InventoryRepository } from "./repositories/inventory/inventory.repository";
import { ProductRepository } from "./repositories/product/product.repository";
import { PurchaseRepository } from "./repositories/purchase/purchase.repository";
import { SalesRepository } from "./repositories/sales/sales.repository";

export class UnitOfWork<TExecutor> {
  public readonly currency: CurrencyRepository;
  public readonly customer: CustomerRepository;
  public readonly product: ProductRepository;
  public readonly purchase: PurchaseRepository;
  public readonly inventory: InventoryRepository;
  public readonly sales: SalesRepository;

  constructor(public readonly executor: TExecutor) {
    this.currency = new CurrencyRepository(executor as any);
    this.customer = new CustomerRepository(executor as any);
    this.product = new ProductRepository(executor as any);
    this.purchase = new PurchaseRepository(executor as any);
    this.inventory = new InventoryRepository(executor as any);
    this.sales = new SalesRepository(executor as any);
  }
}

export const uow = new UnitOfWork(db);
