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
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { number, z } from "zod";

import Currencies from "@/features/currencies/currencies";
import {
  createCurrencyRate,
  getCurrencies,
  getCurrencyRates,
} from "@/actions/currency";
import { toPersianDateTime } from "@/utils/dateUtils";

function CurrenciesPage() {
  const { t } = useTranslation();
  const {
    data: currencyRates = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currencyRates"],
    queryFn: getCurrencyRates,
  });
  const {
    data: currencies = [],
    isLoading: isLoadingCurrencies,
    isError: isErrorCurrencies,
  } = useQuery({
    queryKey: ["currencies"],
    queryFn: getCurrencies,
  });

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [dialogCurrenciesOpen, setDialogCurrenciesOpen] = useState(false);

  const [rate, setRate] = useState<number | null>(null);
  const [currencyId, setCurrencyId] = useState<number | null>(null);

  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: createCurrencyRate,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["currencyRates"],
      });
      resetForm();
    },

    onError: () => {
      setError("ایجاد مشتری با خطا مواجه شد.");
    },
  });

  const resetForm = () => {
    setRate(0);
    setCurrencyId(null);

    setError("");
    setDialogDeleteOpen(false);
    setOpen(false);
    setDialogCurrenciesOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("currencies")}</h1>

          <p className="text-muted-foreground">{t("currencyDescription")}</p>
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
                {t("addCurrency")}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto ">
              <DialogHeader>
                <DialogTitle>{t("addCurrencyRate")}</DialogTitle>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const result = z
                    .object({
                      rate: z.number().min(1, "نرخ ارز الزامی است ."),
                      currencyId: z
                        .number()
                        .nullable() // ← اجازه دادن به null
                        .optional() // ← اختیاری کردن
                        .refine(
                          (val) => val !== null && val !== undefined && val > 0,
                          {
                            message: "ارز الزامی است.",
                          },
                        ),
                    })
                    .safeParse({
                      rate,
                      currencyId,
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
                    result.data.currencyId === null
                  )
                    return;

                  createMutation.mutate({
                    rate: result.data.rate,
                    currencyId: result.data.currencyId,
                  });
                }}
              >
                <div className=" ">
                  <div className="space-y-2">
                    <label
                      htmlFor="currencyRate-rate"
                      className="text-sm font-medium"
                    >
                      {t("currencyRate")}
                    </label>

                    <input
                      id="currencyRate-rate"
                      value={rate?.toString()}
                      onChange={(event) => setRate(+event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="currencyRate-currencyId"
                      className="text-sm font-medium"
                    >
                      {t("selectCurrency")}
                    </label>

                    <select
                      id="currencyRate-currencyId"
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
            open={dialogCurrenciesOpen}
            onOpenChange={(onOpen: boolean) =>
              onOpen ? setDialogCurrenciesOpen(onOpen) : resetForm()
            }
          >
            <DialogTrigger asChild>
              <Button className="ms-2">
                <UserCog className="ml-2 h-4 w-4" />
                {t("manageCurrency")}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{t("manageCurrency")}</DialogTitle>
              </DialogHeader>
              <Currencies />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )}

      {!isLoading && !isError && currencyRates.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && currencyRates.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_1fr_2fr] gap-4 border-b p-4 font-medium">
            <div>{t("currency")}</div>
            <div>{t("currencyRate")}</div>
            <div>{t("date")}</div>
          </div>

          {currencyRates.map((currencyRate) => (
            <div
              key={currencyRate.id}
              className="grid grid-cols-[1fr_1fr_2fr] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{currencyRate.currency?.name}</div>
              <div>{currencyRate.rate}</div>
              <div>{toPersianDateTime(currencyRate.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/currencyRates")({
  component: CurrenciesPage,
});
