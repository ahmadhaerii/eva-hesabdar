import {
  currencies,
  currencyRates,
  customerPayments,
  products,
  salesInvoiceItems,
  salesInvoices,
} from "@/database/schema";
import { BaseRepository } from "../base.repository";
import { and, eq, gt, isNull } from "drizzle-orm";

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

    const invoices = await this.executor
      .select({
        id: salesInvoices.id,
        invoiceNumber: salesInvoices.invoiceNumber,
        customerId: salesInvoices.customerId,
        currencyRateId: salesInvoices.currencyRateId,
        invoiceDate: salesInvoices.invoiceDate,
        totalPrice: salesInvoices.totalPrice,
        discount: salesInvoices.discount,
        amountPayable: salesInvoices.amountPayable,
        currencyRate: currencyRates.rate,
        currencyName: currencies.name,
      })
      .from(salesInvoices)
      .innerJoin(
        currencyRates,
        eq(salesInvoices.currencyRateId, currencyRates.id),
      )
      .innerJoin(currencies, eq(currencyRates.currencyId, currencies.id))
      .where(
        and(
          eq(salesInvoices.customerId, customerId),
          gt(salesInvoices.totalPrice, 0),
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
        adjustmentAmount: customerPayments.adjustmentAmount,
        currencyRateAdjustmentAmount:
          customerPayments.currencyRateAdjustmentAmount,

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
      discount: 0,

      amount: purchase.lineTotal,

      description:
        `خرید ${purchase.productName}` +
        ` در فاکتور شماره ${purchase.invoiceNumber}`,

      debit: purchase.lineTotalCurrencyAmount,

      credit: 0,
    }));

    const invoicesRows = invoices.map((invoice) => ({
      title: "فاکتور خرید" as const,

      date: invoice.invoiceDate,

      currencyAmount: 0,

      currencyName: invoice.currencyName,
      discount: invoice.discount * invoice.currencyRate,

      amount: 0,

      description: `تخفیف در فاکتور شماره ${invoice.id}`,

      debit: 0,

      credit: invoice.discount,
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
      discount: payment.adjustmentAmount,

      description:
        payment.description ??
        `واریز وجه ${payment?.amount?.toLocaleString()} تومان`,

      debit: 0,

      credit: payment.currencyAmount + payment.currencyRateAdjustmentAmount,
    }));

    // -----------------------------
    // 5. Combine
    // -----------------------------

    const statement = [...purchaseRows, ...paymentRows, ...invoicesRows].sort(
      (a, b) => a.date.localeCompare(b.date),
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
        balance: balance.toFixed(3),
      };
    });
    return rows;
  }
}
export const createCustomerStatementExcel = new CreateCustomerStatementExcel();
