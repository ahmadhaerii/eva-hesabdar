import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Product,
  PurchaseInvoiceWithRelations,
  SalesInvoiceItemWithRelations,
  SalesInvoiceWithRelations,
} from "@/database/types/database";
import { useCurrencyStore } from "@/stores/currencyStore";
import { deleteSaleInvoiceItem, getSaleInvoice } from "@/actions/sale";
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
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);

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
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      saleInvoice,
      saleInvoiceItem,
    }: {
      saleInvoice: SalesInvoiceWithRelations;
      saleInvoiceItem: SalesInvoiceItemWithRelations;
    }) => deleteSaleInvoiceItem(saleInvoice, saleInvoiceItem),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["saleInvoice"],
      });
      setDialogDeleteOpen(false);
    },
    onError: (error) => {
      console.error(error);
      setDialogDeleteOpen(false);
    },
  });

  const { t } = useTranslation();

  const defaultCurrency = useCurrencyStore((state) => state.defaultCurrency);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [deleteSalesInvoiceItem, setDeleteSalesInvoiceItem] =
    useState<SalesInvoiceItemWithRelations | null>(null);

  useEffect(() => {
    if (salesInvoice) {
      const total = salesInvoice.saleInvoiceItems.reduce(
        (sum, salesInvoiceItem) => sum + salesInvoiceItem.lineTotal,
        0,
      );
      setTotal(total);
    }
  }, [salesInvoice]);

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
      <Dialog
        open={dialogDeleteOpen}
        onOpenChange={(open: boolean) => setDialogDeleteOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deletePurchaseItem")}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-start gap-2">
            <p>
              {t("deletePurchaseItemsDescription", {
                name: deleteSalesInvoiceItem?.product.name,
              })}
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-start gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogDeleteOpen(false);
              }}
              disabled={deleteMutation.isPending}
            >
              {t("cancel")}
            </Button>

            <Button
              disabled={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate({
                  saleInvoice: salesInvoice!,
                  saleInvoiceItem: deleteSalesInvoiceItem!,
                });
              }}
            >
              {deleteMutation.isPending
                ? t("loading")
                : t("deletePurchaseItem")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 font-medium">
              <div>{t("productName")}</div>
              <div>{t("quantity")}</div>
              <div>{t("unitPrice")}</div>
              <div>{t("total")}</div>
              <div>{t("lineTotalCurrencyAmount")}</div>
              <div>{t("action")}</div>
            </div>

            {salesInvoice?.saleInvoiceItems.map((salesInvoiceItem) => (
              <div
                key={salesInvoiceItem.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 last:border-b-0"
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
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setDeleteSalesInvoiceItem(salesInvoiceItem);
                      setDialogDeleteOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      <p className="bg-destructive-mix py-1 px-2.5 rounded-xl text-sm text-destructive">
        {t("discountSaleInvoicePriceDescription", {
          discountCurrencyAmount: salesInvoice?.discount?.toLocaleString(),
          currencyName: defaultCurrency?.name,
          discount: salesInvoice
            ? (
                salesInvoice?.discount * salesInvoice?.currencyRate.rate
              ).toLocaleString()
            : 0,
          currencyAmountName: salesInvoice?.currencyRate.currency?.name,
        })}
      </p>

      <p className="bg-helper-mix py-1 px-2.5 rounded-xl text-sm text-helper">
        {t("totalSaleInvoicePriceDescription", {
          total: total?.toLocaleString(),
          currencyName: defaultCurrency?.name,
          totalCurrencyAmount: salesInvoice?.totalPrice.toFixed(3),
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
