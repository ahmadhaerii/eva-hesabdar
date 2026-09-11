import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CheckIcon, Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { number, z } from "zod";

import {
  createCustomer,
  createCustomerPayment,
  deleteCustomer,
  getCustomerPayments,
  getCustomers,
  getCustomerTypes,
  updateCustomer,
  updateCustomerPayment,
} from "@/actions/customer";
import CustomerType from "@/features/customers/customerType";
import { WordifyFa } from "@/utils/wordify";
import { useCurrencyStore } from "@/stores/currencyStore";
import { listCurrenciesWithLastRate } from "@/actions/currency";
import { cn } from "@/utils/tailwind";
import { CurrencyWithRate } from "@/database/repositories/currency/currency.repository";

function PaymentsPage() {
  const { t } = useTranslation();
  const defaultCurrency = useCurrencyStore((state) => state.defaultCurrency);

  const {
    data: customers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const {
    data: customerPayments = [],
    isLoading: isLoadingCustomerPayments,
    isError: isErrorCustomerPayments,
  } = useQuery({
    queryKey: ["customerPayments"],
    queryFn: getCustomerPayments,
  });
  const {
    data: currenciesWithLastRate = [],
    isLoading: isLoadingCurrenciesWithLastRate,
    isError: isErrorCurrenciesWithLastRate,
  } = useQuery({
    queryKey: ["listCurrenciesWithLastRate"],
    queryFn: async () => {
      const data = await listCurrenciesWithLastRate();
      if (data) {
        setCurrencyRateId(data[data.length - 1].latestRateId);
        setCurrency(data[data.length - 1]);
      }
      return data;
    },
  });
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);

  const [description, setDescription] = useState("");
  const [currencyRateId, setCurrencyRateId] = useState<number | null>(null);
  const [currency, setCurrency] = useState<CurrencyWithRate | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createCustomerPayment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customerPayments"],
      });
      resetForm();
    },
    onError: (err) => {
      console.error(err);
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
        description: string | null;
        customerId: number;
        amount: number;
        currencyRateAmount: number;
        currencyRateId: number;
        paymentDate: string;
        paymentMethod: string;
        referenceNumber: string | null;
      };
    }) => updateCustomerPayment(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteCustomer(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // فقط عدد
    if (value.length > 8) value = value.slice(0, 8);

    if (value.length >= 5) {
      value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    } else if (value.length >= 4) {
      value = `${value.slice(0, 4)}-${value.slice(4)}`;
    }

    setPaymentDate(value);
  };

  const resetForm = () => {
    setEditingId(null);

    setDescription("");
    setCustomerId(null);
    setAmount(null);
    setPaymentDate("");
    setReferenceNumber("");

    setError("");
    setDialogDeleteOpen(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("payments")}</h1>

          <p className="text-muted-foreground">{t("paymentDescription")}</p>
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
                {t("addPayment")}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t("editPayment") : t("addPayment")}
                </DialogTitle>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();

                  const result = z
                    .object({
                      amount: z.number().min(1),
                      currencyRateId: z.number().min(1),
                      paymentDate: z.string().min(1),
                      referenceNumber: z.string().nullable().optional(),
                      description: z.string().nullable().optional(),
                      customerId: z
                        .number()
                        .nullable() // ← اجازه دادن به null
                        .optional() // ← اختیاری کردن
                        .refine(
                          (val) => val !== null && val !== undefined && val > 0,
                          {
                            message: "نوع مشتری الزامی است.",
                          },
                        ),
                    })
                    .safeParse({
                      amount,
                      paymentDate,
                      currencyRateId,
                      referenceNumber,
                      description,
                      customerId,
                    });

                  if (!result.success) {
                    setError(
                      result.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
                    );
                    return;
                  }
                  if (!currency || !currency?.latestRate) {
                    setError("اطلاعات نامعتبر است.");
                    return;
                  }

                  setError("");
                  if (
                    result.data.customerId === undefined ||
                    result.data.customerId === null
                  )
                    return;
                  if (editingId) {
                    updateMutation.mutate({
                      id: editingId,
                      data: {
                        amount: result.data.amount,
                        currencyRateAmount: +(
                          result.data.amount / currency.latestRate
                        ).toFixed(2),
                        currencyRateId: result.data.currencyRateId,
                        customerId: result.data.customerId,
                        description: result.data.description || null,
                        paymentDate: result.data.paymentDate,
                        paymentMethod: "",
                        referenceNumber: result.data.referenceNumber || null,
                      },
                    });
                  } else {
                    createMutation.mutate({
                      amount: result.data.amount,
                      currencyRateAmount: +(
                        result.data.amount / currency.latestRate
                      ).toFixed(2),
                      currencyRateId: result.data.currencyRateId,
                      customerId: result.data.customerId,
                      description: result.data.description || null,
                      paymentDate: result.data.paymentDate,
                      paymentMethod: "",
                      referenceNumber: result.data.referenceNumber || null,
                    });
                  }
                }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="space-y-2">
                      <label
                        htmlFor="customer-type"
                        className="text-sm font-medium"
                      >
                        {t("selectCustomer")}
                      </label>

                      <select
                        id="customer-type"
                        value={customerId?.toString() ?? ""}
                        onChange={(event) => setCustomerId(+event.target.value)}
                        disabled={createMutation.isPending || isLoading}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">
                          {isLoading ? t("loading") : t("selectCustomer")}
                        </option>

                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="payment-amount"
                        className="text-sm font-medium"
                      >
                        {t("amount")}
                      </label>
                      <input
                        id="payment-amount"
                        value={amount?.toLocaleString()}
                        onChange={(event) =>
                          setAmount(+event.target.value.replaceAll(",", ""))
                        }
                        disabled={createMutation.isPending}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      {amount && WordifyFa(amount)} {defaultCurrency?.name}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="payment-paymentDate"
                        className="text-sm font-medium"
                      >
                        {t("purchaseInvoiceDate")}
                      </label>

                      <input
                        id="payment-paymentDate"
                        value={paymentDate}
                        placeholder="1405-01-01"
                        onChange={handleDateChange}
                        disabled={createMutation.isPending}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="customer-referenceNumber"
                        className="text-sm font-medium"
                      >
                        {t("referenceNumber")}
                      </label>

                      <input
                        id="customer-referenceNumber"
                        value={referenceNumber}
                        onChange={(event) =>
                          setReferenceNumber(event.target.value)
                        }
                        disabled={createMutation.isPending}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2  ">
                      <label className="text-sm font-medium">
                        {t("selectCurrencyRate")}
                      </label>
                      <div className="rounded-md border bg-background h-25 p-1.5">
                        {currenciesWithLastRate.map((currency) => (
                          <div key={currency.id}>
                            <p
                              className={cn(
                                "hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2 rounded-3xl px-2",
                                currencyRateId === currency.latestRateId &&
                                  "bg-accent/60 text-accent-foreground",
                              )}

                              onClick={() => {
                                setCurrencyRateId(currency.latestRateId);
                                setCurrency(currency);
                              }}
                            >
                              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                {currencyRateId &&
                                  currencyRateId === currency.latestRateId && (
                                    <CheckIcon className="size-3.5 shrink-0" />
                                  )}
                              </span>
                              <span>
                                {currency.name} ={" "}
                                {currency.latestRate?.toLocaleString("en-US")}{" "}
                                {defaultCurrency?.name}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor="customer-description"
                      className="text-sm font-medium"
                    >
                      {t("customerDescription")}
                    </label>

                    <textarea
                      id="customer-description"
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
        </div>

        <Dialog
          open={dialogDeleteOpen}
          onOpenChange={(open: boolean) =>
            open ? setDialogDeleteOpen(open) : resetForm()
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteCustomer")}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-start gap-2">
              <p>{t("deleteCustomerDescription", { name: paymentDate })}</p>
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
                {createMutation.isPending ? t("loading") : t("deleteCustomer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )}

      {!isLoading && !isError && customers.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && customers.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_3fr_auto] gap-4 border-b p-4 font-medium">
            <div>{t("customerName")}</div>
            <div>{t("amount")}</div>
            <div>{t("currencyRateAmount")}</div>
            <div>{t("date")}</div>
            <div>{t("referenceNumber")}</div>
            <div>{t("customerDescription")}</div>
            <div>{t("actions")}</div>
          </div>

          {customerPayments.map((customerPayment) => (
            <div
              key={customerPayment.id}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_3fr_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{customerPayment.customer?.displayName}</div>
              <div>{customerPayment.amount.toLocaleString()}</div>
              <div>
                {customerPayment.currencyRateAmount.toLocaleString()}
                {customerPayment.currencyRate?.currency?.name}
              </div>
              <div>{customerPayment.paymentDate}</div>
              <div>{customerPayment.referenceNumber}</div>
              <div className="text-muted-foreground">
                {customerPayment.description || "—"}
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(customerPayment.id);
                    setDescription(customerPayment.description ?? "");
                    setReferenceNumber(customerPayment.referenceNumber ?? "");
                    setPaymentDate(customerPayment.paymentDate);
                    setAmount(customerPayment.amount);
                    setCustomerId(customerPayment.customerId);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setEditingId(customerPayment.id);
                    setDescription(customerPayment.description ?? "");
                    setReferenceNumber(customerPayment.referenceNumber ?? "");
                    setPaymentDate(customerPayment.paymentDate);
                    setAmount(customerPayment.amount);
                    setCustomerId(customerPayment.customerId);
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

export const Route = createFileRoute("/payments")({
  component: PaymentsPage,
});
