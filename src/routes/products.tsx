import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { boolean, number, z } from "zod";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} from "@/actions/product";
import { getCategories } from "@/actions/category";
import { getUnits } from "@/actions/unit";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ProductsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState(0);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      resetForm();
    },

    onError: (mutationError) => {
      console.error("Create product error:", mutationError);

      setError("ایجاد محصول با خطا مواجه شد.");
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
        categoryId: number;
        unitId: number;
        description: string | null;
        isActive: boolean;
      };
    }) => updateProduct(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      resetForm();
    },
    onError: (error) => {
      console.error(error);
      setError("ایجاد محصول با خطا مواجه شد.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteProduct(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /*
   * Create Form
   */

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = z
      .object({
        name: z.string().trim().min(1, "نام محصول الزامی است."),
        categoryId: z.number().min(1, "انتخاب دسته‌بندی الزامی است."),
        unitId: z.number().min(1, "انتخاب واحد الزامی است."),
        description: z.string().trim(),
        isActive: z.boolean(),
      })
      .safeParse({
        name,
        categoryId,
        unitId,
        description,
        isActive,
      });

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ?? "اطلاعات وارد شده صحیح نیست.",
      );

      return;
    }

    setError("");

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          name: result.data.name,
          categoryId: result.data.categoryId,
          unitId: result.data.unitId,
          description: result.data.description || null,
          isActive: result.data.isActive,
        },
      });
    } else {
      createMutation.mutate({
        name: result.data.name,
        categoryId: Number(result.data.categoryId),
        unitId: Number(result.data.unitId),
        description: result.data.description || null,
        isActive: result.data.isActive,
      });
    }
  }

  /*
   * Reset Form
   */

  function resetForm() {
    setName("");
    setCategoryId(null);
    setUnitId(0);
    setDescription("");
    setIsActive(true);
    setError("");
    setEditingId(null);
    setOpen(false);
    setDialogDeleteOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("products")}</h1>

          <p className="text-muted-foreground">{t("productsDescription")}</p>
        </div>

        {/* Create Button */}

        <Dialog
          open={open}
          onOpenChange={(open: boolean) => (open ? setOpen(open) : resetForm())}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />

              {t("addProduct")}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("editProduct") : t("addProduct")}
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name */}

              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium">
                  {t("productName")}
                </label>

                <input
                  id="product-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={createMutation.isPending}
                  autoFocus
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Category */}

              <div className="space-y-2">
                <label
                  htmlFor="product-category"
                  className="text-sm font-medium"
                >
                  {t("category")}
                </label>

                <select
                  id="product-category"
                  value={categoryId?.toString() ?? ""}
                  onChange={(event) => setCategoryId(+event.target.value)}
                  disabled={createMutation.isPending || categoriesLoading}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">
                    {categoriesLoading ? t("loading") : t("selectCategory")}
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit */}

              <div className="space-y-2">
                <label htmlFor="product-unit" className="text-sm font-medium">
                  {t("unit")}
                </label>

                <select
                  id="product-unit"
                  value={unitId?.toString() ?? ""}
                  onChange={(event) => setUnitId(+event.target.value)}
                  disabled={createMutation.isPending || unitsLoading}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">
                    {unitsLoading ? t("loading") : t("selectUnit")}
                  </option>

                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}

              <div className="space-y-2">
                <label
                  htmlFor="product-description"
                  className="text-sm font-medium"
                >
                  {t("description")}
                </label>

                <textarea
                  id="product-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={createMutation.isPending}
                  rows={3}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Active */}

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

              {/* Error */}

              {error && <p className="text-sm text-destructive">{error}</p>}

              {/* Actions */}

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
              <DialogTitle>{t("deleteProduct")}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-start gap-2">
              <p>{t("deleteProductDescription", { name: name })}</p>
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

      {/* Loading */}

      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {/* Error */}

      {isError && (
        <div className="text-destructive">دریافت محصولات با خطا مواجه شد.</div>
      )}

      {/* Empty */}

      {!isLoading && !isError && products.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {/* Products */}

      {!isLoading && !isError && products.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          {/* Header */}

          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 border-b p-4 font-medium">
            <div>{t("productName")}</div>

            <div>{t("category")}</div>

            <div>{t("unit")}</div>

            <div>{t("status")}</div>
            <div>{t("actions")}</div>
          </div>

          {/* Rows */}

          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div className="font-medium">{product.name}</div>

              <div className="text-muted-foreground">
                {product.category?.name ?? "—"}
              </div>

              <div className="text-muted-foreground">
                {product.unit?.name ?? "—"}
              </div>

              <div>{product.isActive ? t("active") : t("inactive")}</div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(product.id);
                    setDescription(product.description ?? "");
                    setName(product.name);
                    setCategoryId(product.categoryId);
                    setUnitId(product.unitId);
                    setIsActive(product.isActive);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setName(product.name);
                    setEditingId(product.id);
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

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});
