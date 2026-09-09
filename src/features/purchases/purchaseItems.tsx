import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import z from "zod";
import { PurchaseInvoiceWithRelations } from "@/database/types/database";
import {
  addPurchaseInvoiceItem,
  deletePurchaseInvoiceItem,
  getPurchaseInvoiceItems,
  updatePurchaseInvoiceItem,
} from "@/actions/purchase";
import { ProductCombobox } from "@/components/ProductCombobox";
import { getCategoriesWithProducts } from "@/actions/category";
interface purchaseInvoiceWithRelations {
  purchaseInvoice: PurchaseInvoiceWithRelations;
}
export default function PurchaseItems({
  purchaseInvoice,
}: purchaseInvoiceWithRelations) {
  const { t } = useTranslation();
  const {
    data: purchaseInvoiceItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchaseInvoiceItems"],
    queryFn: () => getPurchaseInvoiceItems(purchaseInvoice.id),
  });

  const {
    data: categoriesWithProducts = [],
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useQuery({
    queryKey: ["categoriesWithProducts"],
    queryFn: getCategoriesWithProducts,
  });
  console.log("categoriesWithProducts ", categoriesWithProducts);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);

  const [purchaseInvoiceId, setPurchaseInvoiceId] = useState<number | null>(
    null,
  );
  const [productId, setProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [remainingQuantity, setRemainingQuantity] = useState<number | null>(
    null,
  );
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [freightShare, setFreightShare] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [helperDescription, setHelperDescription] = useState("");
  const [
    totalPurchaseInvoicePriceDescription,
    setTotalPurchaseInvoicePriceDescription,
  ] = useState("");
  const [
    totalPurchaseInvoiceFreightShareDescription,
    setTotalPurchaseInvoiceFreightShareDescription,
  ] = useState("");

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: addPurchaseInvoiceItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["purchaseInvoiceItems"],
      });
      resetForm();
    },

    onError: () => {
      setError(" افزودن آیتم با خطا مواجه شد.");
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        purchaseInvoiceId: number;
        productId: number;
        quantity: number;
        remainingQuantity: number;
        freightShare: number;
        unitPrice: number;
        totalPrice: number;
        description?: string | null | undefined;
      };
    }) => updatePurchaseInvoiceItem(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["purchaseInvoiceItems"],
      });
      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deletePurchaseInvoiceItem(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["purchaseInvoiceItems"],
      });

      resetForm();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setTotalPrice(null);
    setPurchaseInvoiceId(null);
    setProductId(null);
    setQuantity(null);
    setRemainingQuantity(null);
    setUnitPrice(null);
    setFreightShare(null);
    setProductName("");
    setDescription("");
    setError("");
    setDialogDeleteOpen(false);
    setOpen(false);
  };

  useEffect(() => {
    if (unitPrice !== null && freightShare !== null && quantity !== null) {
      setHelperDescription(
        `قیمت خرید هر واحد این محصول : ${unitPrice + (unitPrice * freightShare) / 100} ${purchaseInvoice.currency?.name} میباشد`,
      );
    } else {
      setHelperDescription("قیمت فروش محاسبه نشده است");
    }
  }, [unitPrice, freightShare, quantity, productId]);

  useEffect(() => {
    if (purchaseInvoiceItems.length > 0) {
      setTotalPurchaseInvoicePriceDescription(
        ` جمع کل خرید های این فاکتور : ${purchaseInvoiceItems
          .reduce((sum, item) => {
            const subtotal = (item.quantity || 0) * (item.totalPrice || 0);
            return sum + subtotal;
          }, 0)
          .toLocaleString("en-US")} ${purchaseInvoice.currency?.name} میباشد`,
      );

      setTotalPurchaseInvoiceFreightShareDescription(
        ` جمع کل حمل و نقل های این فاکتور : ${purchaseInvoiceItems
          .reduce((sum, item) => {
            const subtotal =
              (((item.unitPrice || 0) * (item.freightShare || 0)) / 100) *
              (item.quantity || 0);
            return sum + subtotal;
          }, 0)
          .toLocaleString("en-US")} ${purchaseInvoice.currency?.name} میباشد`,
      );
    } else {
      setTotalPurchaseInvoicePriceDescription("    محاسبه نشده است");
      setTotalPurchaseInvoiceFreightShareDescription(
        "  حمل و نقل  محاسبه نشده است ",
      );
    }
  }, [purchaseInvoiceItems]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {t("purchaseItemDescription")}
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
              {t("addPurchaseItem")}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("editPurchaseItem") : t("addPurchaseItem")}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();

                const result = z
                  .object({
                    productId: z.number().min(1),
                    quantity: z.number().min(1),
                    freightShare: z
                      .number()
                      .min(1)
                      .max(100, "حمل و نقل باید بین 1 تا 100 باشد"),
                    unitPrice: z.number().min(1),
                    description: z.string().nullable().optional(),
                  })
                  .safeParse({
                    productId,
                    quantity,
                    freightShare,
                    unitPrice,
                    description,
                  });

                if (!result.success) {
                  setError(
                    result.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
                  );
                  return;
                }
                const totalPrice =
                  result.data.unitPrice +
                  (result.data.unitPrice * result.data.freightShare) / 100;
                setTotalPrice(totalPrice);
                if (!totalPrice) {
                  setError("مجموع اشتباه است");
                  return;
                }
                setError("");

                if (editingId) {
                  updateMutation.mutate({
                    id: editingId,
                    data: {
                      purchaseInvoiceId: purchaseInvoice.id,
                      productId: result.data.productId,
                      quantity: result.data.quantity,
                      remainingQuantity: result.data.quantity,
                      freightShare: result.data.freightShare,
                      unitPrice: result.data.unitPrice,
                      totalPrice: totalPrice,
                      description: result.data.description || null,
                    },
                  });
                } else {
                  createMutation.mutate({
                    purchaseInvoiceId: purchaseInvoice.id,
                    productId: result.data.productId,
                    quantity: result.data.quantity,
                    remainingQuantity: result.data.quantity,
                    freightShare: result.data.freightShare,
                    unitPrice: result.data.unitPrice,
                    totalPrice: totalPrice,
                    description: result.data.description || null,
                  });
                }
              }}
            >
              <ProductCombobox
                value={productId}
                onValueChange={(productId, product) => setProductId(productId)}
                items={categoriesWithProducts}
                label={t("selectProduct")}
              />
              <div className="space-y-2">
                <label
                  htmlFor="customer-type-name"
                  className="text-sm font-medium"
                >
                  {t("quantity")}
                </label>

                <input
                  id="customer-type-name"
                  value={quantity?.toString()}
                  onChange={(event) => setQuantity(+event.target.value)}
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
                  {t("unitPrice")}
                </label>

                <input
                  id="customer-type-profit-percent"
                  value={unitPrice?.toString()}
                  onChange={(event) => setUnitPrice(+event.target.value)}
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
                  {t("freightShare")}
                </label>

                <input
                  id="customer-type-profit-percent"
                  value={freightShare?.toString()}
                  onChange={(event) => setFreightShare(+event.target.value)}
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
              {helperDescription && (
                <p className="bg-helper-mix py-1 px-2.5 rounded-xl text-sm text-helper">
                  {helperDescription}
                </p>
              )}
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
              <DialogTitle>{t("deletePurchaseItem")}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-start gap-2">
              <p>
                {t("deletePurchaseItemsDescription", { name: productName })}
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
                  : t("deletePurchaseItem")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )}

      {!isLoading && !isError && purchaseInvoiceItems.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && purchaseInvoiceItems.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_2fr_auto] gap-4 border-b p-4 font-medium">
            <div>{t("productName")}</div>
            <div>{t("quantity")}</div>
            <div>{t("remainingQuantity")}</div>
            <div>{t("unitPrice")}</div>
            <div>{t("freightShare")}</div>
            <div>{t("totalPrice")}</div>
            <div>{t("description")}</div>
            <div>{t("actions")}</div>
          </div>

          {purchaseInvoiceItems.map((purchaseInvoiceItem) => (
            <div
              key={purchaseInvoiceItem.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_2fr_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{purchaseInvoiceItem.product.name}</div>
              <div>{purchaseInvoiceItem.quantity.toLocaleString("en-US")}</div>
              <div>
                {purchaseInvoiceItem.remainingQuantity.toLocaleString("en-US")}
              </div>
              <div>{purchaseInvoiceItem.unitPrice.toLocaleString("en-US")}</div>
              <div>{purchaseInvoiceItem.freightShare} %</div>
              <div>
                {purchaseInvoiceItem.totalPrice.toLocaleString("en-US")}
              </div>

              <div className="text-muted-foreground">
                {purchaseInvoiceItem.description || "—"}
              </div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(purchaseInvoiceItem.id);
                    setDescription(purchaseInvoiceItem.description ?? "");
                    setTotalPrice(purchaseInvoiceItem.totalPrice);
                    setProductId(purchaseInvoiceItem.productId);
                    setQuantity(purchaseInvoiceItem.quantity);
                    setRemainingQuantity(purchaseInvoiceItem.remainingQuantity);
                    setUnitPrice(purchaseInvoiceItem.unitPrice);
                    setFreightShare(purchaseInvoiceItem.freightShare);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setEditingId(purchaseInvoiceItem.id);
                    setProductName(purchaseInvoiceItem.product.name);
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
      {totalPurchaseInvoicePriceDescription && (
        <p className="bg-helper-mix py-1 px-2.5 rounded-xl text-sm text-helper">
          {totalPurchaseInvoicePriceDescription}
        </p>
      )}
      {totalPurchaseInvoiceFreightShareDescription && (
        <p className="bg-alert-mix py-1 px-2.5 rounded-xl text-sm text-alert">
          {totalPurchaseInvoiceFreightShareDescription}
        </p>
      )}
    </div>
  );
}
