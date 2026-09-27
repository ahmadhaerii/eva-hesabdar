import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PurchaseInvoiceWithRelations } from "@/database/types/database";
import SaleInvoice from "@/features/sales/saleInvoice";
import { getSaleInvoices } from "@/actions/sale";
import ShowSaleInvoice from "@/features/sales/showSaleInvoice";

function SalesPage() {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  useState<PurchaseInvoiceWithRelations | null>(null);
  const [dialogSaleInvoiceOpen, setDialogSaleInvoiceOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    data: saleInvoices = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["saleInvoices"],
    queryFn: getSaleInvoices,
  });

  const resetForm = async () => {
    setEditingId(null);
    setDialogSaleInvoiceOpen(false);
    await queryClient.invalidateQueries({
      queryKey: ["purchaseInvoices"],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("sales")}</h1>

          <p className="text-muted-foreground">{t("saleDescription")}</p>
        </div>
        <div>
          <Dialog
            open={dialogSaleInvoiceOpen}
            onOpenChange={(onOpen: boolean) =>
              onOpen ? setDialogSaleInvoiceOpen(onOpen) : resetForm()
            }
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                {t("addSaleInvoice")}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t("showSaleInvoice") : t("addSaleInvoice")}
                </DialogTitle>
              </DialogHeader>
              {editingId === null && (
                <SaleInvoice
                  onClose={() => {
                    setDialogSaleInvoiceOpen(false);
                    queryClient.invalidateQueries({
                      queryKey: ["saleInvoices"],
                    });
                  }}
                />
              )}
              {editingId !== null && (
                <ShowSaleInvoice
                  saleInvoiceEditingId={editingId}
                  onClose={() => {
                    setDialogSaleInvoiceOpen(false);
                    queryClient.invalidateQueries({
                      queryKey: ["saleInvoices"],
                    });
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )}

      {!isLoading && !isError && saleInvoices.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && saleInvoices.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 font-medium">
            <div>{t("invoiceNumber")}</div>
            <div>{t("customerName")}</div>
            <div>{t("currency")}</div>
            <div>{t("currencyRate")}</div>
            <div>{t("items")}</div>
            <div>{t("total")}</div>
            <div>{t("purchaseInvoiceDate")}</div>
            <div>{t("actions")}</div>
          </div>

          {saleInvoices.map((saleInvoice) => (
            <div
              key={saleInvoice.id}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{saleInvoice.id}</div>
              <div>{saleInvoice.customer?.displayName}</div>
              <div>{saleInvoice.currencyRate?.currency?.name}</div>
              <div>
                {saleInvoice.currencyRate?.rate.toLocaleString("en-US")}
              </div>
              <div>{saleInvoice.saleInvoiceItems.length}</div>
              <div>{saleInvoice.amountPayable.toLocaleString()}</div>
              <div>{saleInvoice.invoiceDate}</div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(saleInvoice.id);
                    setDialogSaleInvoiceOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/sales")({
  component: SalesPage,
});
