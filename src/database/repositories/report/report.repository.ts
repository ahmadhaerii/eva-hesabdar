import {
  currencies,
  currencyRates,
  customerPayments,
  products,
  salesInvoiceItems,
  salesInvoices,
} from "@/database/schema";
import { BaseRepository } from "../base.repository";
import { and, eq, isNull } from "drizzle-orm";

export class CreateCustomerStatementExcel extends BaseRepository {
  async createCustomerStatement(customerId: number): Promise<any[]> {
    const purchases = await this.executor
      .select({
        invoiceNumber: salesInvoices.id,
        invoiceDate: salesInvoices.invoiceDate,

        currencyRate: currencyRates.rate,
        currencyName: currencies.name,

        lineTotal: salesInvoiceItems.lineTotal,
        lineTotalCurrencyAmount: salesInvoiceItems.lineTotalCurrencyAmount,

        productName: products.name,
      })
      .from(salesInvoiceItems)
      .innerJoin(
        salesInvoices,
        eq(salesInvoiceItems.salesInvoiceId, salesInvoices.id),
      )
      .innerJoin(products, eq(salesInvoiceItems.productId, products.id))
      .innerJoin(
        currencyRates,
        eq(salesInvoices.currencyRateId, currencyRates.id),
      )
      .innerJoin(currencies, eq(currencyRates.currencyId, currencies.id))
      .where(
        and(
          eq(salesInvoices.customerId, customerId),
          isNull(salesInvoices.deletedAt),
        ),
      );

    // -----------------------------
    // 2. Get payments
    // -----------------------------

    const payments = await this.executor
      .select({
        date: customerPayments.paymentDate,

        amount: customerPayments.amount,

        currencyAmount: customerPayments.currencyRateAmount,

        description: customerPayments.description,

        referenceNumber: customerPayments.referenceNumber,

        currencyName: currencies.name,
      })
      .from(customerPayments)
      .innerJoin(
        currencyRates,
        eq(customerPayments.currencyRateId, currencyRates.id),
      )
      .innerJoin(currencies, eq(currencyRates.currencyId, currencies.id))
      .where(
        and(
          eq(customerPayments.customerId, customerId),
          isNull(customerPayments.deletedAt),
        ),
      );

    // -----------------------------
    // 3. Create purchase rows
    // -----------------------------

    const purchaseRows = purchases.map((purchase) => ({
      title: "خرید" as const,

      date: purchase.invoiceDate,

      currencyAmount: purchase.lineTotalCurrencyAmount,

      currencyName: purchase.currencyName,

      amount: purchase.lineTotal,

      description:
        `خرید ${purchase.productName}` +
        ` در فاکتور شماره ${purchase.invoiceNumber}`,

      debit: purchase.lineTotalCurrencyAmount,

      credit: 0,
    }));

    // -----------------------------
    // 4. Create payment rows
    // -----------------------------

    const paymentRows = payments.map((payment) => ({
      title: "واریز" as const,

      date: payment.date,

      currencyAmount: payment.currencyAmount,

      currencyName: payment.currencyName,

      amount: payment.amount,

      description:
        payment.description ??
        `واریز وجه ${payment.amount.toLocaleString()} تومان`,

      debit: 0,

      credit: payment.currencyAmount,
    }));

    // -----------------------------
    // 5. Combine
    // -----------------------------

    const statement = [...purchaseRows, ...paymentRows].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // -----------------------------
    // 6. Calculate balance
    // -----------------------------

    let balance = 0;

    const rows = statement.map((item) => {
      balance += item.debit;
      balance -= item.credit;

      return {
        ...item,
        balance: balance.toFixed(2),
      };
    });
    return rows;
  }
}
export const createCustomerStatementExcel = new CreateCustomerStatementExcel();
