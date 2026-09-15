import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import z from "zod";
import {
  CustomerWithRelations,
  Product,
  PurchaseInvoiceWithRelations,
  SalesInvoiceWithRelations,
} from "@/database/types/database";
import {
  deletePurchaseInvoiceItem,
  getPurchaseInvoiceItemsForProduct,
  updatePurchaseInvoiceItem,
} from "@/actions/purchase";
import { ProductCombobox } from "@/components/ProductCombobox";
import { getCategoriesWithProducts } from "@/actions/category";
import { getCustomers } from "@/actions/customer";
import { listCurrenciesWithLastRate } from "@/actions/currency";
import { cn } from "@/utils/tailwind";
import { useCurrencyStore } from "@/stores/currencyStore";
import { WordifyFa } from "@/utils/wordify";
import { createSaleInvoice, getSaleInvoice } from "@/actions/sale";
interface purchaseInvoiceWithRelations {
  purchaseInvoice: PurchaseInvoiceWithRelations;
}
interface InvoiceItem {
  id: number;
  product: Product;
  productId: number;
  quantity: number;
  saleUnitPrice: number;
  suggestedUnitPrice: number;
  salesInvoiceId: number;
  selectedRowOfPurchaseInvoiceItems: number[];
  lineTotal: number;
  lineTotalCurrencyAmount: number;
  createdAt: string;
}
interface SaleInvoiceProps {
  onClose: () => void;
  saleInvoiceEditingId: number;
}

export default function ShowSaleInvoice({
  onClose,
  saleInvoiceEditingId,
}: SaleInvoiceProps) {
  const [salesInvoice, setSalesInvoice] =
    useState<SalesInvoiceWithRelations | null>(null);
  const queryClient = useQueryClient();

  const {
    data: saleInvoice = undefined,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["saleInvoice"],
    queryFn: async () => {
      const data = await getSaleInvoice(saleInvoiceEditingId);
      if (data) {
        setSalesInvoice(data);
      }

      console.log(data);
      return data;
    },
  });
  const { t } = useTranslation();

  const defaultCurrency = useCurrencyStore((state) => state.defaultCurrency);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  // useEffect(() => {
  //   if (productId !== null && quantity !== null && saleUnitPrice !== null) {
  //     const total = quantity * saleUnitPrice;
  //     setHelperDescription(
  //       `قیمت فروش کل  : ${total.toLocaleString("en-US")} ${defaultCurrency?.name}  ، معادل  ${WordifyFa(total)} ${defaultCurrency?.name}   میباشد`,
  //     );
  //   } else {
  //     setHelperDescription("قیمت فروش محاسبه نشده است");
  //   }
  // }, [quantity, productId, saleUnitPrice]);

  useEffect(() => {
    if (salesInvoice) {
      const total = salesInvoice.saleInvoiceItems.reduce(
        (sum, salesInvoiceItem) => sum + salesInvoiceItem.lineTotal,
        0,
      );
      setTotal(total);
    }
  }, [salesInvoice]);

  // useEffect(() => {
  //   if (productId !== null && quantity !== null) {
  //     const selectedRows = [];
  //     let remainingQuantity = quantity;

  //     for (const item of purchaseInvoiceItemsForProduct) {
  //       if (remainingQuantity <= 0) break;

  //       selectedRows.push(item.id);

  //       remainingQuantity -= item.remainingQuantity;
  //     }
  //     setSelectedRowOfPurchaseInvoiceItems(selectedRows);
  //   } else {
  //     setSelectedRowOfPurchaseInvoiceItems([]);
  //   }
  // }, [quantity, productId]);

  // useEffect(() => {
  //   const currency = currenciesWithLastRate.find(
  //     (currencyWithLastRate) =>
  //       currencyWithLastRate.latestRateId == currencyRateId,
  //   );
  //   const profitPercent = selectedCustomer?.customProfitPercent
  //     ? selectedCustomer?.customProfitPercent
  //     : selectedCustomer?.customerType?.profitPercent;
  //   const totalPrice =
  //     purchaseInvoiceItemsForProduct[purchaseInvoiceItemsForProduct.length - 1]
  //       ?.totalPrice;

  //   if (
  //     selectedCustomer &&
  //     currency &&
  //     totalPrice &&
  //     profitPercent &&
  //     currency?.latestRate !== null &&
  //     productId !== null
  //   ) {
  //     const suggestedUnitPrice =
  //       totalPrice * (1 + profitPercent / 100) * currency.latestRate;
  //     setSuggestedUnitPrice(suggestedUnitPrice);
  //     setPriceHelperDescription(
  //       `قیمت فروش هر واحد : ${suggestedUnitPrice.toLocaleString("en-US")} ${defaultCurrency?.name}   میباشد`,
  //     );
  //   } else {
  //     setPriceHelperDescription("قیمت فروش محاسبه نشده است");
  //   }

  //   setTotalRemainingQuantity(
  //     purchaseInvoiceItemsForProduct.reduce(
  //       (sum, lot) => sum + lot.remainingQuantity,
  //       0,
  //     ),
  //   );
  // }, [purchaseInvoiceItemsForProduct]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{t("saleInvoiceDescription")}</p>
        </div>
      </div>

      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="saleInvoice-customer" className="text-sm font-medium">
            {t("customer")}
          </label>
          <span className="w-full block rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            {salesInvoice?.customer.displayName}
          </span>
        </div>
        <div className="space-y-2">
          <label htmlFor="sale-invoiceDate" className="text-sm font-medium">
            {t("purchaseInvoiceDate")}
          </label>

          <span className="w-full block rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            {salesInvoice?.invoiceDate}
          </span>
        </div>
        <div className="space-y-2 max-h-25 overflow-y-auto">
          <p className=" ">{t("selectCurrencyRate")}</p>
          <div>
            <p className="  flex items-center gap-2 rounded-3xl px-2 bg-accent/60 text-accent-foreground">
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="size-3.5 shrink-0" />
              </span>
              <span>
                {salesInvoice?.currencyRate.currency?.name} ={" "}
                {salesInvoice?.currencyRate.rate.toLocaleString("en-US")}{" "}
                {defaultCurrency?.name}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{t("saleInvoiceDescription")}</p>
        </div>
      </div>
      {!isLoading &&
        !isError &&
        salesInvoice?.saleInvoiceItems.length === 0 && (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">{t("noData")}</p>
          </div>
        )}

      {!isLoading &&
        !isError &&
        salesInvoice?.saleInvoiceItems &&
        salesInvoice.saleInvoiceItems.length > 0 && (
          <div className="rounded-lg border">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 font-medium">
              <div>{t("productName")}</div>
              <div>{t("quantity")}</div>
              <div>{t("unitPrice")}</div>
              <div>{t("total")}</div>
              <div>{t("lineTotalCurrencyAmount")}</div>
            </div>

            {salesInvoice?.saleInvoiceItems.map((salesInvoiceItem) => (
              <div
                key={salesInvoiceItem.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 last:border-b-0"
              >
                <div>{salesInvoiceItem.product.name}</div>
                <div>{salesInvoiceItem.quantity.toLocaleString("en-US")}</div>
                <div>
                  {salesInvoiceItem.saleUnitPrice.toLocaleString("en-US")}
                </div>
                <div>
                  {(
                    salesInvoiceItem.quantity * salesInvoiceItem.saleUnitPrice
                  ).toLocaleString()}{" "}
                  {defaultCurrency?.name}
                </div>
                <div>
                  {salesInvoiceItem.lineTotalCurrencyAmount.toLocaleString()}{" "}
                  {salesInvoice.currencyRate.currency?.name}
                </div>
              </div>
            ))}
          </div>
        )}

      <p className="bg-helper-mix py-1 px-2.5 rounded-xl text-sm text-helper">
        {t("totalSaleInvoicePriceDescription", {
          total: total?.toLocaleString(),
          currencyName: defaultCurrency?.name,
          TotalCurrencyAmount: salesInvoice?.totalPrice,
          currencyAmountName: salesInvoice?.currencyRate.currency?.name,
        })}
      </p>

      <div className="flex justify-start gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onClose();
          }}
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
