import {
  createCustomerType,
  deleteCustomerType,
  getCustomerTypes,
  updateCustomer,
  updateCustomerType,
} from "@/actions/customer";
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

export default function CustomerType() {
  const { t } = useTranslation();

  const {
    data: customerTypes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: getCustomerTypes,
  });
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [name, setName] = useState("");
  const [profitPercent, setProfitPercent] = useState(0);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createCustomerType,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customerTypes"],
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
        profitPercent: number;
        description: string | null;
      };
    }) => updateCustomerType(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customerTypes"],
      });
      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteCustomerType(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customerTypes"],
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
    setProfitPercent(0);
    setDescription("");
    setError("");
    setDialogDeleteOpen(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {t("customerTypeDescription")}
          </p>
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
              {t("addCustomerType")}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("editCustomerType") : t("addCustomerType")}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();

                const result = z
                  .object({
                    name: z.string().trim().min(1, "نام نوع مشتری الزامی است."),
                    profitPercent: z.number().min(1, "درصد سود الزامی است."),
                    description: z.string().trim(),
                  })
                  .safeParse({
                    name,
                    profitPercent,
                    description,
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
                      profitPercent: result.data.profitPercent,
                      description: result.data.description || null,
                    },
                  });
                } else {
                  createMutation.mutate({
                    name: result.data.name,
                    profitPercent: result.data.profitPercent,
                    description: result.data.description || null,
                  });
                }
              }}
            >
              <div className="space-y-2">
                <label
                  htmlFor="customer-type-name"
                  className="text-sm font-medium"
                >
                  {t("customerTypeName")}
                </label>

                <input
                  id="customer-type-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="customer-type-profit-percent"
                  className="text-sm font-medium"
                >
                  {t("customerTypeProfitPercent")}
                </label>

                <input
                  id="customer-type-profit-percent"
                  value={profitPercent}
                  onChange={(event) => setProfitPercent(+event.target.value)}
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="customer-type-description"
                  className="text-sm font-medium"
                >
                  {t("description")}
                </label>

                <textarea
                  id="customer-type"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={createMutation.isPending}
                  rows={3}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
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
              <DialogTitle>{t("deleteCustomerType")}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-start gap-2">
              <p>{t("deleteCustomerTypesDescription", { name: name })}</p>
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
                  : t("deleteCustomerType")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">
          دریافت دسته‌بندی‌ها با خطا مواجه شد.
        </div>
      )}

      {!isLoading && !isError && customerTypes.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && customerTypes.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_1fr_2fr_auto_auto] gap-4 border-b p-4 font-medium">
            <div>{t("customerTypeName")}</div>
            <div>{t("customerTypeProfitPercent")}</div>
            <div>{t("customerTypeDescription")}</div>
            <div>{t("status")}</div>
            <div>{t("actions")}</div>
          </div>

          {customerTypes.map((customerType) => (
            <div
              key={customerType.id}
              className="grid grid-cols-[1fr_1fr_2fr_auto_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{customerType.name}</div>
              <div>{customerType.profitPercent}</div>

              <div className="text-muted-foreground">
                {customerType.description || "—"}
              </div>

              <div>{customerType.isActive ? t("active") : t("inactive")}</div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(customerType.id);
                    setProfitPercent(customerType.profitPercent);
                    setName(customerType.name);
                    setDescription(customerType.description ?? "");
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setName(customerType.name);
                    setEditingId(customerType.id);
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
