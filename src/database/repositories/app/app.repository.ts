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
  customersCount: number;
  productsCount: number;
  purchaseInvoicesCount: number;
  salesInvoicesCount: number;
  totalInventoryValue: number;
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
export class AppRepository extends BaseRepository {
  async getDashboardData(): Promise<DashboardData> {
    const currentJYear = moment().jYear();

    const result: DashboardData = await this.executor
      .get(sql`WITH latest_rates AS (
    SELECT cr.currency_id, cr.rate
    FROM currency_rates cr
    INNER JOIN (
        SELECT currency_id, MAX(id) AS max_id
        FROM currency_rates
        GROUP BY currency_id
    ) m ON m.max_id = cr.id
)
SELECT 
    (SELECT COUNT(*) FROM products) AS productsCount,
    (SELECT COUNT(*) FROM customers) AS customersCount,
    (SELECT COUNT(*) FROM purchase_invoices) AS purchaseInvoicesCount,
    (SELECT COUNT(*) FROM sales_invoices) AS salesInvoicesCount,
    (SELECT json_object(
        'id', id,
        'display_name', display_name,
        'totalInvoices', total_invoices,
        'totalPayments', total_payments,
        'debt', debt
    )
    FROM (
        SELECT 
            c.id,
            c.display_name,
            COALESCE(inv.total_invoices, 0) AS total_invoices,
            COALESCE(pay.total_payments, 0) AS total_payments,
            COALESCE(inv.total_invoices, 0) - COALESCE(pay.total_payments, 0) AS debt
        FROM customers c
        LEFT JOIN (
            SELECT 
                si.customer_id, 
                SUM(si.total_price * lr.rate) AS total_invoices
            FROM sales_invoices si
            INNER JOIN currency_rates cr_base ON si.currency_rate_id = cr_base.id
            INNER JOIN latest_rates lr ON lr.currency_id = cr_base.currency_id
            GROUP BY si.customer_id
        ) inv ON inv.customer_id = c.id
        LEFT JOIN (
            SELECT 
                cp.customer_id, 
                SUM(cp.currency_rate_amount * lr.rate) AS total_payments
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
    (SELECT COALESCE(SUM(si.total_price * lr.rate), 0)
     FROM sales_invoices si
     INNER JOIN currency_rates cr_base ON si.currency_rate_id = cr_base.id
     INNER JOIN latest_rates lr ON lr.currency_id = cr_base.currency_id
    ) AS allTimeSales,
    (SELECT COALESCE(SUM(si.total_price * lr.rate), 0)
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
        totalPrice: salesInvoices.totalPrice,
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
}

export const appRepository = new AppRepository();
