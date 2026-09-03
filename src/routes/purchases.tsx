import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, ShoppingCart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { number, z } from "zod";
import {
  createPurchaseInvoice,
  deletePurchaseInvoice,
  getPurchaseInvoices,
  updatePurchaseInvoice,
} from "@/actions/purchases";
import { getCurrencies, getRatesByCurrency } from "@/actions/currency";
import { PurchaseInvoiceWithRelations } from "@/database/types/database";
import PurchaseItems from "@/features/purchases/purchaseItems";
import { useCurrencyStore } from "@/stores/currencyStore";

function PurchasesPage() {
  const { t } = useTranslation();

  const [currencyRateId, setCurrencyRateId] = useState<number | null>(null);
  const [currencyId, setCurrencyId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedPurchaseInvoice, setSelectedPurchaseInvoice] =
    useState<PurchaseInvoiceWithRelations | null>(null);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [dialogPurchaseItemsOpen, setDialogPurchaseItemsOpen] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Confirmed");

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    data: purchaseInvoices = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchaseInvoices"],
    queryFn: getPurchaseInvoices,
  });

  const {
    data: currencies = [],
    isLoading: isLoadingCurrencies,
    isError: isErrorCurrencies,
  } = useQuery({
    queryKey: ["currencies"],
    queryFn: getCurrencies,
  });
  const {
    data: currencyRates = [],
    isLoading: isLoadingCurrencyRates,
    isError: isErrorCurrencyRates,
  } = useQuery({
    queryKey: ["currencyRates", currencyId],
    queryFn: () => getRatesByCurrency({ id: currencyId! }),
    enabled: !!currencyId,
  });

  const createMutation = useMutation({
    mutationFn: createPurchaseInvoice,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["purchaseInvoices"],
      });
      resetForm();
    },

    onError: () => {
      setError("ایجاد مشتری با خطا مواجه شد.");
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        invoiceNumber: string;
        invoiceDate: string;
        currencyId: number;
        currencyRateId: number;
        description?: string | null | undefined;
        status?: "Draft" | "Confirmed" | "Cancelled" | undefined;
      };
    }) => updatePurchaseInvoice(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["purchaseInvoices"],
      });
      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deletePurchaseInvoice(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["purchaseInvoices"],
      });

      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setInvoiceNumber("");
    setInvoiceDate("");
    setCurrencyId(null);
    setCurrencyRateId(null);
    setDescription("");
    setStatus("");

    setError("");
    setDialogDeleteOpen(false);
    setOpen(false);
    setDialogPurchaseItemsOpen(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // فقط عدد
    if (value.length > 8) value = value.slice(0, 8);

    // اضافه کردن خط تیره خودکار
    if (value.length >= 5) {
      value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    } else if (value.length >= 4) {
      value = `${value.slice(0, 4)}-${value.slice(4)}`;
    }

    setInvoiceDate(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("purchases")}</h1>

          <p className="text-muted-foreground">{t("purchaseDescription")}</p>
        </div>
        <div>
          <Dialog
            open={open}
            onOpenChange={(onOpen: boolean) =>
              onOpen ? setOpen(onOpen) : resetForm()
            }
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                {t("addPurchaseInvoice")}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId
                    ? t("editPurchaseInvoice")
                    : t("addPurchaseInvoice")}
                </DialogTitle>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const result = z
                    .object({
                      invoiceNumber: z
                        .string()
                        .min(1, "شماره رسید را وارد کنید"),
                      currencyId: z
                        .number()
                        .nullable()
                        .optional()
                        .refine(
                          (val) => val !== null && val !== undefined && val > 0,
                          {
                            message: " ارز الزامی است.",
                          },
                        ),
                      currencyRateId: z
                        .number()
                        .nullable()
                        .optional()
                        .refine(
                          (val) => val !== null && val !== undefined && val > 0,
                          {
                            message: " نرخ ارز الزامی است.",
                          },
                        ),
                      invoiceDate: z
                        .string()
                        .regex(
                          /^1[34]\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
                          "تاریخ به درستی وارد نشده است",
                        ),
                      description: z.string().nullable().optional(),
                      status: z
                        .enum(["Draft", "Confirmed", "Cancelled"])
                        .optional(),
                    })
                    .safeParse({
                      invoiceNumber,
                      invoiceDate,
                      description,
                      status,
                      currencyId,
                      currencyRateId,
                    });

                  if (!result.success) {
                    setError(
                      result.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
                    );
                    return;
                  }

                  setError("");
                  if (
                    result.data.currencyId === undefined ||
                    result.data.currencyId === null ||
                    result.data.currencyRateId === undefined ||
                    result.data.currencyRateId === null
                  )
                    return;
                  if (editingId) {
                    updateMutation.mutate({
                      id: editingId,
                      data: {
                        invoiceNumber: result.data.invoiceNumber,
                        invoiceDate: result.data.invoiceDate,
                        description: result.data.description || null,
                        status: result.data.status,
                        currencyId: result.data.currencyId,
                        currencyRateId: result.data.currencyRateId,
                      },
                    });
                  } else {
                    createMutation.mutate({
                      invoiceNumber: result.data.invoiceNumber,
                      invoiceDate: result.data.invoiceDate,
                      description: result.data.description || null,
                      status: result.data.status,
                      currencyId: result.data.currencyId,
                      currencyRateId: result.data.currencyRateId,
                    });
                  }
                }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="purchase-invoiceNumber"
                      className="text-sm font-medium"
                    >
                      {t("purchaseInvoiceNumber")}
                    </label>

                    <input
                      id="purchase-invoiceNumber"
                      value={invoiceNumber}
                      onChange={(event) => setInvoiceNumber(event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="purchase-currency"
                      className="text-sm font-medium"
                    >
                      {t("selectCurrency")}
                    </label>

                    <select
                      id="purchase-currency"
                      value={currencyId?.toString() ?? ""}
                      onChange={(event) => setCurrencyId(+event.target.value)}
                      disabled={createMutation.isPending || isLoadingCurrencies}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">
                        {isLoadingCurrencies
                          ? t("loading")
                          : t("selectCurrency")}
                      </option>

                      {currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="purchase-currencyRate"
                      className="text-sm font-medium"
                    >
                      {t("selectCurrencyRate")}
                    </label>

                    <select
                      id="purchase-currencyRate"
                      value={currencyRateId?.toString() ?? ""}
                      onChange={(event) =>
                        setCurrencyRateId(+event.target.value)
                      }
                      disabled={
                        createMutation.isPending || isLoadingCurrencyRates
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">
                        {isLoadingCurrencyRates
                          ? t("loading")
                          : t("selectCurrencyRate")}
                      </option>

                      {currencyRates.map((currencyRate) => (
                        <option key={currencyRate.id} value={currencyRate.id}>
                          {currencyRate.rate}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="purchase-invoiceDate"
                      className="text-sm font-medium"
                    >
                      {t("purchaseInvoiceDate")}
                    </label>

                    <input
                      id="purchase-invoiceDate"
                      value={invoiceDate}
                      placeholder="1405-01-01"
                      onChange={handleDateChange}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor="purchase-description"
                      className="text-sm font-medium"
                    >
                      {t("purchaseDescription")}
                    </label>

                    <textarea
                      id="purchase-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      disabled={createMutation.isPending}
                      rows={3}
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && <p className="text-sm text-destructive">{error}</p>}

                {/* Actions */}
                <div className="flex justify-start gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                    }}
                    disabled={createMutation.isPending}
                  >
                    {t("cancel")}
                  </Button>

                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t("loading") : t("save")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogPurchaseItemsOpen}
            onOpenChange={(onOpen: boolean) =>
              onOpen ? setDialogPurchaseItemsOpen(onOpen) : resetForm()
            }
          >
            <DialogContent className="sm:max-w-4/6">
              <DialogHeader>
                <DialogTitle>{t("purchaseItems")}</DialogTitle>
              </DialogHeader>
              <PurchaseItems purchaseInvoice={selectedPurchaseInvoice!} />
            </DialogContent>
          </Dialog>
        </div>

        <Dialog
          open={dialogDeleteOpen}
          onOpenChange={(open: boolean) =>
            open ? setDialogDeleteOpen(open) : resetForm()
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deletePurchaseInvoice")}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-start gap-2">
              <p>
                {t("deletePurchaseInvoiceDescription", { name: invoiceNumber })}
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-start gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                }}
                disabled={deleteMutation.isPending}
              >
                {t("cancel")}
              </Button>

              <Button
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate({
                    id: editingId!,
                  });
                }}
              >
                {createMutation.isPending
                  ? t("loading")
                  : t("deletePurchaseInvoice")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )}

      {!isLoading && !isError && purchaseInvoices.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && purchaseInvoices.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 font-medium">
            <div>{t("purchaseInvoiceNumber")}</div>
            <div>{t("currency")}</div>
            <div>{t("currencyRate")}</div>
            <div>{t("purchaseItems")}</div>
            <div>{t("purchaseInvoiceDate")}</div>
            <div>{t("purchaseDescription")}</div>
            <div>{t("actions")}</div>
          </div>

          {purchaseInvoices.map((purchaseInvoice) => (
            <div
              key={purchaseInvoice.id}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{purchaseInvoice.invoiceNumber}</div>
              <div>{purchaseInvoice.currency?.name}</div>
              <div>
                {purchaseInvoice.currencyRate?.rate.toLocaleString("en-US")}
              </div>
              <div>{purchaseInvoice.items.length}</div>
              <div>{purchaseInvoice.invoiceDate}</div>
              <div className="text-muted-foreground">
                {purchaseInvoice.description || "—"}
              </div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setSelectedPurchaseInvoice(purchaseInvoice);
                    setDialogPurchaseItemsOpen(true);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(purchaseInvoice.id);
                    setInvoiceNumber(purchaseInvoice.invoiceNumber ?? "");
                    setCurrencyId(purchaseInvoice.currencyId ?? "");
                    setCurrencyRateId(purchaseInvoice.currencyRateId ?? "");
                    setInvoiceDate(purchaseInvoice.invoiceDate ?? "");
                    setDescription(purchaseInvoice.description ?? "");
                    setStatus(purchaseInvoice.status ?? "");
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setEditingId(purchaseInvoice.id);
                    setInvoiceNumber(purchaseInvoice.invoiceNumber ?? "");
                    setDialogDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/purchases")({
  component: PurchasesPage,
});
