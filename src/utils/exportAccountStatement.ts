// src/utils/exportAccountStatement.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * ساخت و دانلود فایل اکسل گردش حساب
 * @param {Array} rows - آرایه‌ای از آبجکت‌های گردش حساب
 * @param {string} fileName - نام فایل خروجی (بدون پسوند)
 */
export const exportAccountStatementToExcel = async (
  rows: any,
  fileName = "گردش-حساب",
) => {
  // --------------------------------------------------
  // ۱. ساخت Workbook و Worksheet
  // --------------------------------------------------
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("گردش حساب");

  // --------------------------------------------------
  // ۲. تنظیمات ستون‌ها
  // --------------------------------------------------
  worksheet.columns = [
    { header: "عنوان", key: "title", width: 15 },
    { header: "تاریخ", key: "date", width: 15 },
    { header: "مبلغ ارزی", key: "currencyAmount", width: 20 },
    { header: "مبلغ", key: "amount", width: 20 },
    { header: "بدهی", key: "balance", width: 20 },
    { header: "توضیحات", key: "description", width: 60 },
  ];

  // --------------------------------------------------
  // ۳. اضافه کردن ردیف‌های داده
  // --------------------------------------------------
  for (const row of rows) {
    worksheet.addRow({
      title: row.title,
      date: row.date,
      currencyAmount: `${row.currencyAmount.toFixed(2)} ` + row.currencyName,
      amount: `${row.amount.toLocaleString()} تومان`,
      balance: `${row.balance.toLocaleString()} ` + row.currencyName,
      description: row.description,
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
