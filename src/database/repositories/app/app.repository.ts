import { and, asc, desc, eq, gt, min, sql } from "drizzle-orm";

import { purchaseInvoices, salesInvoices } from "../../schema";

import { PurchaseInvoiceWithRelations } from "../../types/database";
import { BaseRepository } from "../base.repository";

import moment from "moment-jalaali";

export interface DashboardData {
  allTimeSales: number;
  bestSellingProduct: string; // '{"productId":3,"productName":"تست","totalSoldQuantity":112.0}';
  mostIndebted: string; // '{"productId":3,"productName":"تست","totalSoldQuantity":112.0}';
  currentYearSales: number;
  totalDebt: number;
  customersCount: number;
  productsCount: number;
  purchaseInvoicesCount: number;
  salesInvoicesCount: number;
  totalInventoryValue: number;
  totalInventoryValueInCurrency: number;
  totalRemainingQuantity: number;
}
export interface Last12MonthsSales {
  months: {
    year: number;
    month: number;
    monthName: string;
    totalSales: number;
    invoiceCount: number;
    formattedMonth: string;
  }[];
  totalSales: number;
  totalInvoices: number;
  averageMonthlySales: number;
}
export interface DashboardStats {
  countLastMonth: number;
  countThisYear: number;
  countTotal: number;
  paymentsLastMonth: number;
  paymentsThisYear: number;
  paymentsTotal: number;
  profitLastMonth: number;
  profitThisYear: number;
  profitTotal: number;
  salesLastMonth: number;
  salesThisYear: number;
  salesTotal: number;

  adjustmentAmountLastMonth: number;
  adjustmentAmountThisYear: number;
  adjustmentAmountTotal: number;

  discountLastMonth: number;
  discountThisYear: number;
  discountTotal: number;
}
export class AppRepository extends BaseRepository {
  async getDashboardData(): Promise<DashboardData> {
    const currentJYear = moment().jYear();

    const result: DashboardData = await this.executor.get(sql`
        WITH latest_rates AS (
    SELECT cr.currency_id, cr.rate
    FROM currency_rates cr
    INNER JOIN (
        SELECT currency_id, MAX(id) AS max_id
        FROM currency_rates
        GROUP BY currency_id
    ) m ON m.max_id = cr.id
) ,
customer_debts AS (
    SELECT 
        c.id,
        c.display_name,
        COALESCE(inv.total_invoices, 0) AS total_invoices,
        COALESCE(pay.total_payments, 0) AS total_payments,
    ( COALESCE(inv.total_invoices_currency_amount, 0) - (COALESCE(pay.total_payments_currency_amount, 0) + COALESCE(pay.total_currency_rate_adjustment_amount, 0) ) ) * inv.last_rate AS debt 
    FROM customers c
    LEFT JOIN (
        SELECT 
            si.customer_id, 
             lr.rate as last_rate ,
            SUM(si.amount_payable * lr.rate) AS total_invoices,
            SUM(si.amount_payable ) AS total_invoices_currency_amount
        FROM sales_invoices si
        INNER JOIN currency_rates cr_base ON si.currency_rate_id = cr_base.id
        INNER JOIN latest_rates lr ON lr.currency_id = cr_base.currency_id
        GROUP BY si.customer_id
    ) inv ON inv.customer_id = c.id
    LEFT JOIN (
        SELECT 
            cp.customer_id, 
            SUM(cp.currency_rate_amount ) AS total_payments_currency_amount,
            SUM(cp.currency_rate_adjustment_amount ) AS total_currency_rate_adjustment_amount,
            SUM(cp.amount ) AS total_payments 
        FROM customer_payments cp
        INNER JOIN currency_rates cr_base ON cp.currency_rate_id = cr_base.id
        INNER JOIN latest_rates lr ON lr.currency_id = cr_base.currency_id
        GROUP BY cp.customer_id
    ) pay ON pay.customer_id = c.id
)
SELECT 
    (SELECT COUNT(*) FROM products) AS productsCount,
    (SELECT COALESCE(SUM(debt), 0) FROM customer_debts WHERE debt > 0) AS totalDebt,

    (SELECT COUNT(*) FROM customers) AS customersCount,
    (SELECT COUNT(*) FROM purchase_invoices) AS purchaseInvoicesCount,
    (SELECT COUNT(*) FROM sales_invoices) AS salesInvoicesCount,
    (SELECT json_object(
        'id', id,
        'displayName', display_name,
        'totalInvoices', total_invoices,
        'totalPayments', total_payments,
        'debt', debt,
        'debtCurrencyAmount', debt_currency_amount
    )
    FROM (
        SELECT 
            c.id,
            c.display_name,
            COALESCE(inv.total_invoices, 0) AS total_invoices,
            COALESCE(pay.total_payments, 0) AS total_payments,
            (COALESCE(inv.total_invoices_currency_amount, 0) - (COALESCE(pay.total_payments_currency_amount, 0)+ COALESCE(pay.total_currency_rate_adjustment_amount, 0))) * inv.last_rate AS debt ,
            COALESCE(inv.total_invoices_currency_amount, 0) AS total_invoices_currency_amount,
            COALESCE(inv.total_invoices_currency_amount, 0) - (COALESCE(pay.total_payments_currency_amount, 0) + COALESCE(pay.total_currency_rate_adjustment_amount, 0) ) AS debt_currency_amount,
            COALESCE(pay.total_payments, 0) AS total_payments_currency_amount 
        FROM customers c
        LEFT JOIN (
            SELECT 
                si.customer_id, 
                lr.rate as last_rate ,
                SUM(si.amount_payable * lr.rate) AS total_invoices,
                SUM(si.amount_payable ) AS total_invoices_currency_amount

            FROM sales_invoices si
            INNER JOIN currency_rates cr_base ON si.currency_rate_id = cr_base.id
            INNER JOIN latest_rates lr ON lr.currency_id = cr_base.currency_id
            GROUP BY si.customer_id
        ) inv ON inv.customer_id = c.id
        LEFT JOIN (
            SELECT 
                cp.customer_id, 
                 SUM(cp.currency_rate_amount ) AS total_payments_currency_amount,
                             SUM(cp.currency_rate_adjustment_amount ) AS total_currency_rate_adjustment_amount,

                  SUM(cp.amount ) AS total_payments 
            FROM customer_payments cp
            INNER JOIN currency_rates cr_base ON cp.currency_rate_id = cr_base.id
            INNER JOIN latest_rates lr ON lr.currency_id = cr_base.currency_id
            GROUP BY cp.customer_id
        ) pay ON pay.customer_id = c.id
        ORDER BY debt DESC
        LIMIT 1
    )
    ) AS mostIndebted,
    (SELECT COALESCE(SUM(remaining_quantity), 0) FROM purchase_invoice_items) AS totalRemainingQuantity,
      (
        SELECT COALESCE(SUM(pii2.remaining_quantity * pii2.total_price * lr.rate), 0)
        FROM purchase_invoice_items pii2
        INNER JOIN purchase_invoices pi2 ON pii2.purchase_invoice_id = pi2.id
        INNER JOIN latest_rates lr ON lr.currency_id = pi2.currency_id
        WHERE pii2.remaining_quantity > 0
    ) AS totalInventoryValue,
     (
        SELECT COALESCE(SUM(pii2.remaining_quantity * pii2.total_price), 0)
        FROM purchase_invoice_items pii2
        INNER JOIN purchase_invoices pi2 ON pii2.purchase_invoice_id = pi2.id
        WHERE pii2.remaining_quantity > 0
    ) AS totalInventoryValueInCurrency,
    (
        SELECT json_object(
            'productId', product_id,
            'productName', product_name,
            'totalSoldQuantity', total_sold
        )
        FROM (
            SELECT 
                pii3.product_id,
                p.name AS product_name,
                SUM(pii3.quantity) AS total_sold
            FROM purchase_invoice_items pii3
            INNER JOIN products p ON pii3.product_id = p.id
            INNER JOIN purchase_invoices pi3 ON pii3.purchase_invoice_id = pi3.id
            GROUP BY pii3.product_id, p.name
            ORDER BY total_sold DESC
            LIMIT 1
        )
    ) AS bestSellingProduct,
    (SELECT COALESCE(SUM(si.amount_payable  ), 0)
     FROM sales_invoices si
     INNER JOIN currency_rates cr_base ON si.currency_rate_id = cr_base.id
     INNER JOIN latest_rates lr ON lr.currency_id = cr_base.currency_id
    ) AS allTimeSales,
    (SELECT COALESCE(SUM(si.amount_payable  ), 0)
     FROM sales_invoices si
     INNER JOIN currency_rates cr_base ON si.currency_rate_id = cr_base.id
     INNER JOIN latest_rates lr ON lr.currency_id = cr_base.currency_id
     WHERE substr(si.invoice_date, 1, 4) = ${String(currentJYear)}
    ) AS currentYearSales
  `);
    return result;
  }
  async getLast12MonthsSales(): Promise<Last12MonthsSales> {
    const now = moment();

    const months: {
      year: number;
      month: number;
      monthName: string;
      startDate: string;
      endDate: string;
      totalSales: number;
      invoiceCount: number;
    }[] = [];

    for (let i = 11; i >= 0; i--) {
      const m = moment(now).subtract(i, "jMonth");

      months.push({
        year: m.jYear(),
        month: m.jMonth() + 1,
        monthName: this.getMonthName(m.jMonth() + 1),
        startDate: m.clone().startOf("jMonth").format("jYYYY-jMM-jDD"),
        endDate: m.clone().endOf("jMonth").format("jYYYY-jMM-jDD"),
        totalSales: 0,
        invoiceCount: 0,
      });
    }

    // ابتدای اولین ماه
    const startDate = moment(now)
      .subtract(11, "jMonth")
      .startOf("jMonth")
      .format("jYYYY-jMM-jDD");

    // انتهای ماه جاری
    const endDate = moment(now).endOf("jMonth").format("jYYYY-jMM-jDD");

    const sales = await this.executor
      .select({
        totalPrice: salesInvoices.amountPayable,
        saleDate: salesInvoices.invoiceDate,
      })
      .from(salesInvoices)
      .where(
        sql`${salesInvoices.invoiceDate} >= ${startDate}
        AND ${salesInvoices.invoiceDate} <= ${endDate}`,
      )
      .orderBy(sql`${salesInvoices.invoiceDate} ASC`);

    // گروه‌بندی بر اساس تاریخ شمسی
    sales.forEach((sale) => {
      if (!sale.saleDate) return;

      // invoiceDate = "1405-05-05"
      const [year, month] = String(sale.saleDate).split("-").map(Number);

      const found = months.find((m) => m.year === year && m.month === month);

      if (found) {
        found.totalSales += Number(sale.totalPrice);
        found.invoiceCount += 1;
      }
    });

    return {
      months: months.map((m) => ({
        year: m.year,
        month: m.month,
        monthName: m.monthName,
        totalSales: m.totalSales,
        invoiceCount: m.invoiceCount,
        formattedMonth: `${m.monthName} ${m.year}`,
      })),

      totalSales: months.reduce((sum, m) => sum + m.totalSales, 0),

      totalInvoices: months.reduce((sum, m) => sum + m.invoiceCount, 0),

      averageMonthlySales:
        months.reduce((sum, m) => sum + m.totalSales, 0) / 12,
    };
  }

  private getMonthName(month: number): string {
    const monthNames = [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ];
    return monthNames[month - 1];
  }

  getJalaliRanges() {
    moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

    const now = moment();

    return {
      today: now.format("jYYYY-jMM-jDD"), // 1405-05-05
      monthStart: now.clone().startOf("jMonth").format("jYYYY-jMM-jDD"), // 1405-05-01
      yearStart: now.clone().startOf("jYear").format("jYYYY-jMM-jDD"), // 1405-01-01
    };
  }
  async getDashboardStats() {
    const { today, monthStart, yearStart } = this.getJalaliRanges();

    const result = await this.executor.get<{
      countLastMonth: number;
      countThisYear: number;
      countTotal: number;

      salesLastMonth: number;
      salesThisYear: number;
      salesTotal: number;

      profitLastMonth: number;
      profitThisYear: number;
      profitTotal: number;

      paymentsLastMonth: number;
      paymentsThisYear: number;
      paymentsTotal: number;

      discountLastMonth: number;
      discountThisYear: number;
      discountTotal: number;

      adjustmentAmountLastMonth: number;
      adjustmentAmountThisYear: number;
      adjustmentAmountTotal: number;
    }>(sql`
    WITH item_cost AS (
      SELECT
        sia.sales_invoice_item_id AS salesInvoiceItemId,
        SUM(sia.quantity * pii.total_price) AS cost    
      FROM sales_inventory_allocations sia
      JOIN purchase_invoice_items pii ON pii.id = sia.purchase_invoice_item_id
      GROUP BY sia.sales_invoice_item_id
    ),

    sales_stats AS (
      SELECT
        COUNT(DISTINCT CASE WHEN si.invoice_date >= ${monthStart} AND si.invoice_date <= ${today} THEN si.id END) AS countLastMonth,
        COUNT(DISTINCT CASE WHEN si.invoice_date >= ${yearStart}  AND si.invoice_date <= ${today} THEN si.id END) AS countThisYear,
        COUNT(DISTINCT si.id) AS countTotal,


        SUM(CASE WHEN si.invoice_date >= ${monthStart} AND si.invoice_date <= ${today}
                 THEN si.amount_payable ELSE 0 END) AS salesLastMonth,

        SUM(CASE WHEN si.invoice_date >= ${yearStart}  AND si.invoice_date <= ${today}
                 THEN si.amount_payable ELSE 0 END) AS salesThisYear,

        SUM(si.amount_payable) AS salesTotal,


        
        SUM(CASE WHEN si.invoice_date >= ${monthStart} AND si.invoice_date <= ${today}
                 THEN si.discount ELSE 0 END) AS discountLastMonth,

        SUM(CASE WHEN si.invoice_date >= ${yearStart}  AND si.invoice_date <= ${today}
                 THEN si.discount ELSE 0 END) AS discountThisYear,

        SUM(si.discount) AS discountTotal,



        SUM(CASE WHEN si.invoice_date >= ${monthStart} AND si.invoice_date <= ${today}
                 THEN (sii.line_total_currency_amount - COALESCE(ic.cost, 0)) ELSE 0 END)   -  
        SUM(CASE WHEN si.invoice_date >= ${monthStart}  AND si.invoice_date <= ${today}
                 THEN COALESCE(si.discount , 0 ) ELSE 0 END)  AS profitLastMonth,

        SUM(CASE WHEN si.invoice_date >= ${yearStart}  AND si.invoice_date <= ${today}
                 THEN (sii.line_total_currency_amount - COALESCE(ic.cost, 0)) ELSE 0 END)  - 
        SUM(CASE WHEN si.invoice_date >= ${yearStart}  AND si.invoice_date <= ${today}
                 THEN COALESCE(si.discount , 0 ) ELSE 0 END)  AS profitThisYear,

       (SUM(sii.line_total_currency_amount - COALESCE(ic.cost, 0)) - SUM (COALESCE(si.discount , 0 )) )  AS profitTotal


      FROM sales_invoices si
      JOIN sales_invoice_items sii ON sii.sales_invoice_id = si.id
      LEFT JOIN item_cost ic ON ic.salesInvoiceItemId = sii.id
      WHERE  si.deleted_at IS NULL
    ),

    payment_stats AS (
      SELECT
        SUM(CASE WHEN payment_date >= ${monthStart} AND payment_date <= ${today} THEN currency_rate_amount ELSE 0 END) AS paymentsLastMonth,
        SUM(CASE WHEN payment_date >= ${yearStart}  AND payment_date <= ${today} THEN currency_rate_amount ELSE 0 END) AS paymentsThisYear,
        SUM(currency_rate_amount) AS paymentsTotal, 

        SUM(CASE WHEN payment_date >= ${monthStart} AND payment_date <= ${today} THEN currency_rate_adjustment_amount ELSE 0 END) AS adjustmentAmountLastMonth,
        SUM(CASE WHEN payment_date >= ${yearStart}  AND payment_date <= ${today} THEN currency_rate_adjustment_amount ELSE 0 END) AS adjustmentAmountThisYear,
        SUM(currency_rate_adjustment_amount) AS adjustmentAmountTotal

      FROM customer_payments
      WHERE deleted_at IS NULL
    )

    SELECT * FROM sales_stats, payment_stats;
  `);

    // مقادیر NULL رو به 0 تبدیل می‌کنیم (وقتی هیچ داده‌ای نیست)
    return {
      countLastMonth: result?.countLastMonth ?? 0,
      countThisYear: result?.countThisYear ?? 0,
      countTotal: result?.countTotal ?? 0,

      salesLastMonth: result?.salesLastMonth ?? 0,
      salesThisYear: result?.salesThisYear ?? 0,
      salesTotal: result?.salesTotal ?? 0,

      profitLastMonth: result?.profitLastMonth ?? 0,
      profitThisYear: result?.profitThisYear ?? 0,
      profitTotal: result?.profitTotal ?? 0,

      paymentsLastMonth: result?.paymentsLastMonth ?? 0,
      paymentsThisYear: result?.paymentsThisYear ?? 0,
      paymentsTotal: result?.paymentsTotal ?? 0,

      discountLastMonth: result?.discountLastMonth ?? 0,
      discountThisYear: result?.discountThisYear ?? 0,
      discountTotal: result?.discountTotal ?? 0,

      adjustmentAmountLastMonth: result?.adjustmentAmountLastMonth ?? 0,
      adjustmentAmountThisYear: result?.adjustmentAmountThisYear ?? 0,
      adjustmentAmountTotal: result?.adjustmentAmountTotal ?? 0,
    };
  }
}

export const appRepository = new AppRepository();
