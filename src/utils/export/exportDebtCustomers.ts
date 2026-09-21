// src/utils/exportAccountStatement.js
import { CurrencyWithRate } from "@/database/repositories/currency/currency.repository";
import { Currency } from "@/database/types/database";
import { useCurrencyStore } from "@/stores/currencyStore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * ساخت و دانلود فایل اکسل گردش حساب
 * @param {Array} rows - آرایه‌ای از آبجکت‌های گردش حساب
 * @param {string} fileName - نام فایل خروجی (بدون پسوند)
 */
export const exportDebtCustomers = async (
  customers: {
    id: number;
    displayName: string;
    mobile: string | null;
    totalInvoices: number;
    totalPayments: number;
    totalAdjustmentAmount: number;
    debt: number;
  }[],
  currency: CurrencyWithRate,
  defaultCurrency: Currency,
  fileName = "بدهکاران",
) => {
  // --------------------------------------------------
  // ۱. ساخت Workbook و Worksheet
  // --------------------------------------------------
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("بدهکاران");

  // --------------------------------------------------
  // ۲. تنظیمات ستون‌ها
  // --------------------------------------------------
  worksheet.columns = [
    { header: "نام", key: "customerName", width: 15 },
    { header: "موبایل", key: "mobile", width: 15 },
    { header: "مجموع فاکتورها", key: "sumSalePurchase", width: 20 },
    { header: "دریافتی", key: "received", width: 20 },
    { header: "بدهی ارزی", key: "debtRateAmount", width: 20 },
    { header: "بدهی", key: "debt", width: 20 },
  ];

  // --------------------------------------------------
  // ۳. اضافه کردن ردیف‌های داده
  // --------------------------------------------------
  for (const row of customers) {
    const debt =
      Math.round(row.debt * currency.latestRate!)?.toLocaleString() +
      "  " +
      defaultCurrency?.name;

    worksheet.addRow({
      customerName: row.displayName,
      mobile: row.mobile,
      sumSalePurchase: row.totalInvoices?.toLocaleString(),
      received: row.totalPayments?.toLocaleString(),
      debtRateAmount: row.debt?.toLocaleString() + "  " + currency?.name,
      debt: debt,
    });
  }

  // --------------------------------------------------
  // ۴. استایل هدر
  // --------------------------------------------------
  const header = worksheet.getRow(1);
  header.font = { bold: true };
  header.alignment = { horizontal: "center", vertical: "middle" };

  // --------------------------------------------------
  // ۵. استایل ردیف‌های داده
  // --------------------------------------------------
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: "middle" };
    }
  });

  // --------------------------------------------------
  // ۶. تنظیمات نمایش: راست‌چین + فریز کردن هدر
  // --------------------------------------------------
  worksheet.views = [
    {
      rightToLeft: true,
      state: "frozen",
      ySplit: 1,
    },
  ];

  // --------------------------------------------------
  // ۷. تبدیل به بافر و دانلود
  // --------------------------------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${fileName}.xlsx`);
};
