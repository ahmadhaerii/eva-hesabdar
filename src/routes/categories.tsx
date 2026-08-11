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
import {
  createCategory,
  getCategories,
  updateCategory,
} from "@/actions/category";

function CategoriesPage() {
  const { t } = useTranslation();
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const createMutation = useMutation({
    mutationFn: createCategory,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      setName("");
      setDescription("");
      setError("");
      setOpen(false);
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
        description: string | null;
      };
    }) => updateCategory(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      setEditingId(null);
      setName("");
      setDescription("");
      setOpen(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });
  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("categories")}</h1>

          <p className="text-muted-foreground">{t("categoryDescription")}</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              {t("addCategory")}
            </Button>
          </DialogTrigger>

          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("editCategory") : t("addCategory")}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();

                const result = z
                  .object({
                    name: z.string().trim().min(1, "نام دسته‌بندی الزامی است."),
                    description: z.string().trim(),
                  })
                  .safeParse({
                    name,
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
                      description: result.data.description || null,
                    },
                  });
                } else {
                  createMutation.mutate({
                    name: result.data.name,
                    description: result.data.description || null,
                  });
                }
              }}
            >
              <div className="space-y-2">
                <label htmlFor="category-name" className="text-sm font-medium">
                  {t("categoryName")}
                </label>

                <input
                  id="category-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={createMutation.isPending}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category-description"
                  className="text-sm font-medium"
                >
                  {t("categoryDescription")}
                </label>

                <textarea
                  id="category-description"
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
      </div>

      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">
          دریافت دسته‌بندی‌ها با خطا مواجه شد.
        </div>
      )}

      {!isLoading && !isError && categories.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && categories.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_2fr_auto_auto] gap-4 border-b p-4 font-medium">
            <div>{t("categoryName")}</div>
            <div>{t("categoryDescription")}</div>
            <div>{t("status")}</div>
            <div>{t("actions")}</div>
          </div>

          {categories.map((category) => (
            <div
              key={category.id}
              className="grid grid-cols-[1fr_2fr_auto_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{category.name}</div>

              <div className="text-muted-foreground">
                {category.description || "—"}
              </div>

              <div>{category.isActive ? t("active") : t("inactive")}</div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(category.id);
                    setName(category.name);
                    setDescription(category.description ?? "");
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    console.log("delete", category.id);
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

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});
