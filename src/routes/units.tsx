import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Plus } from "lucide-react";
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
import { z } from "zod";
import { createUnit, deleteUnit, getUnits, updateUnit } from "@/actions/unit";

function UnitsPage() {
  const { t } = useTranslation();
  const {
    data: units = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["units"],
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
        symbol: string;
        name: string;
        description: string | null;
      };
    }) => updateUnit(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["units"],
      });

      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteUnit(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["units"],
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
    setDescription("");
    setError("");
    setSymbol("");
    setDialogDeleteOpen(false);
    setOpen(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("units")}</h1>

          <p className="text-muted-foreground">{t("unitDescription")}</p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(open: boolean) => (open ? setOpen(open) : resetForm())}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              {t("addUnit")}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("editUnit") : t("addUnit")}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();

                const result = z
                  .object({
                    name: z.string().trim().min(1, "نام دسته‌بندی الزامی است."),
                    symbol: z.string().trim().min(1, " کد واحد الزامی است."),
                    description: z.string().trim(),
                  })
                  .safeParse({
                    name,
                    symbol,
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
                      symbol: result.data.symbol,
                      name: result.data.name,
                      description: result.data.description || null,
                    },
                  });
                } else {
                  createMutation.mutate({
                    name: result.data.name,
                    symbol: result.data.symbol,
                    description: result.data.description || null,
                  });
                }
              }}
            >
              <div className="space-y-2">
                <label htmlFor="unit-name" className="text-sm font-medium">
                  {t("unitName")}
                </label>

                <input
                  id="unit-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="unit-name" className="text-sm font-medium">
                  {t("symbol")}
                </label>

                <input
                  id="unit-name"
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="unit-description"
                  className="text-sm font-medium"
                >
                  {t("unitDescription")}
                </label>

                <textarea
                  id="unit-description"
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
                  onClick={() => setOpen(false)}
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
              <DialogTitle>{t("deleteUnit")}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-start gap-2">
              <p>{t("deleteUnitDescription", { name: name })}</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-start gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogDeleteOpen(false)}
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
                {createMutation.isPending ? t("loading") : t("deleteUnit")}
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

      {!isLoading && !isError && units.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && units.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_1fr_2fr_auto_auto] gap-4 border-b p-4 font-medium">
            <div>{t("unitName")}</div>
            <div>{t("symbol")}</div>
            <div>{t("unitDescription")}</div>
            <div>{t("status")}</div>
            <div>{t("actions")}</div>
          </div>

          {units.map((unit) => (
            <div
              key={unit.id}
              className="grid grid-cols-[1fr_1fr_2fr_auto_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{unit.name}</div>

              <div>{unit.symbol}</div>

              <div className="text-muted-foreground">
                {unit.description || "—"}
              </div>

              <div>{unit.isActive ? t("active") : t("inactive")}</div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(unit.id);
                    setSymbol(unit.symbol);
                    setName(unit.name);
                    setDescription(unit.description ?? "");
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setName(unit.name);
                    setSymbol(unit.symbol);
                    setEditingId(unit.id);
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

export const Route = createFileRoute("/units")({
  component: UnitsPage,
});
