// src/utils/exportAccountStatement.js
import { InventorySummary } from "@/database/types/database";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * ساخت و دانلود فایل اکسل گردش حساب
 * @param {Array} rows - آرایه‌ای از آبجکت‌های گردش حساب
 * @param {string} fileName - نام فایل خروجی (بدون پسوند)
 */
export const exportInventoryToExcel = async (
  rows: InventorySummary[],
  fileName = "'گزارش انبار'",
) => {
  // --------------------------------------------------
  // ۱. ساخت Workbook و Worksheet
  // --------------------------------------------------
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("گزارش انبار");

  // --------------------------------------------------
  // ۲. تنظیمات ستون‌ها
  // --------------------------------------------------
  worksheet.columns = [
    { header: "نام", key: "productName", width: 15 },
    { header: "تعداد خرید", key: "totalPurchased", width: 15 },
    { header: "تعداد فروش", key: "totalSoldOrUsed", width: 20 },
    { header: "باقی مانده", key: "totalRemaining", width: 20 },
  ];

  // --------------------------------------------------
  // ۳. اضافه کردن ردیف‌های داده
  // --------------------------------------------------
  for (const row of rows) {
    worksheet.addRow({
      productName: row.productName,
      totalPurchased: row.totalPurchased?.toLocaleString(),
      totalSoldOrUsed: row.totalSoldOrUsed?.toLocaleString(),
      totalRemaining: row.totalRemaining?.toLocaleString(),
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
