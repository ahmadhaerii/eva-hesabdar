import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import z from "zod";
import {
  createCurrency,
  deleteCurrency,
  getCurrencies,
  updateCurrency,
} from "@/actions/currency";

export default function Currencies() {
  const { t } = useTranslation();

  const {
    data: currencies = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currencies"],
    queryFn: getCurrencies,
  });
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isBase, setIsBase] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createCurrency,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["currencies"],
      });
      resetForm();
    },

    onError: () => {
      setError("ایجاد دسته‌بندی با خطا مواجه شد.");
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name: string;
        code: string;
        isBase: boolean;
        isActive: boolean;
      };
    }) => updateCurrency(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["currencies"],
      });
      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteCurrency(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["currencies"],
      });

      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setIsActive(true);
    setIsBase(false);
    setError("");
    setDialogDeleteOpen(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{t("currencyDescription")}</p>
        </div>
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

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("editCurrency") : t("addCurrency")}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();

                const result = z
                  .object({
                    name: z.string().trim().min(1, "نام الزامی است."),
                    code: z.string().trim().min(1, "کد الزامی است."),
                    isActive: z.boolean(),
                    isBase: z.boolean(),
                  })
                  .safeParse({
                    name,
                    code,
                    isActive,
                    isBase,
                  });

                if (!result.success) {
                  setError(
                    result.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
                  );
                  return;
                }

                setError("");

                if (editingId) {
                  updateMutation.mutate({
                    id: editingId,
                    data: {
                      name: result.data.name,
                      code: result.data.code,
                      isBase: result.data.isBase,
                      isActive: result.data.isActive,
                    },
                  });
                } else {
                  createMutation.mutate({
                    name: result.data.name,
                    code: result.data.code,
                    isBase: result.data.isBase,
                    isActive: result.data.isActive,
                  });
                }
              }}
            >
              <div className="space-y-2">
                <label htmlFor="currency-name" className="text-sm font-medium">
                  {t("currencyName")}
                </label>

                <input
                  id="currency-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="currency-code" className="text-sm font-medium">
                  {t("currencyCode")}
                </label>

                <input
                  id="currency-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="product-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  disabled={createMutation.isPending}
                />

                <label htmlFor="product-active" className="text-sm font-medium">
                  {t("active")}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="product-active"
                  type="checkbox"
                  checked={isBase}
                  onChange={(event) => setIsBase(event.target.checked)}
                  disabled={createMutation.isPending}
                />

                <label htmlFor="product-active" className="text-sm font-medium">
                  {t("isBase")}
                </label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

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
          open={dialogDeleteOpen}
          onOpenChange={(open: boolean) =>
            open ? setDialogDeleteOpen(open) : resetForm()
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteCurrency")}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-start gap-2">
              <p>{t("deleteCurrencyDescription", { name: name })}</p>
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
                {createMutation.isPending ? t("loading") : t("deleteCurrency")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )}

      {!isLoading && !isError && currencies.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && currencies.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_1fr_2fr_auto_auto] gap-4 border-b p-4 font-medium">
            <div>{t("currencyName")}</div>
            <div>{t("currencyCode")}</div>
            <div>{t("isBase")}</div>
            <div>{t("status")}</div>
            <div>{t("actions")}</div>
          </div>

          {currencies.map((currency) => (
            <div
              key={currency.id}
              className="grid grid-cols-[1fr_1fr_2fr_auto_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{currency.name}</div>
              <div>{currency.code}</div>
              <div>{currency.isBase ? t("active") : t("inactive")}</div>
              <div>{currency.isActive ? t("active") : t("inactive")}</div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(currency.id);
                    setCode(currency.code);
                    setName(currency.name);
                    setIsBase(currency.isBase);
                    setIsActive(currency.isActive);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setName(currency.name);
                    setEditingId(currency.id);
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
