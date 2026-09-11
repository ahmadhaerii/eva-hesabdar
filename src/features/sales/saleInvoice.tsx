import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import z from "zod";
import {
  CustomerWithRelations,
  Product,
  PurchaseInvoiceWithRelations,
} from "@/database/types/database";
import {
  deletePurchaseInvoiceItem,
  getPurchaseInvoiceItemsForProduct,
  updatePurchaseInvoiceItem,
} from "@/actions/purchase";
import { ProductCombobox } from "@/components/ProductCombobox";
import { getCategoriesWithProducts } from "@/actions/category";
import { getCustomers } from "@/actions/customer";
import { listCurrenciesWithLastRate } from "@/actions/currency";
import { cn } from "@/utils/tailwind";
import { useCurrencyStore } from "@/stores/currencyStore";
import { WordifyFa } from "@/utils/wordify";
import { createSaleInvoice } from "@/actions/sale";
interface purchaseInvoiceWithRelations {
  purchaseInvoice: PurchaseInvoiceWithRelations;
}
interface InvoiceItem {
  id: number;
  product: Product;
  productId: number;
  quantity: number;
  saleUnitPrice: number;
  suggestedUnitPrice: number;
  salesInvoiceId: number;
  selectedRowOfPurchaseInvoiceItems: number[];
  lineTotal: number;
  createdAt: string;
}
interface SaleInvoiceProps {
  onClose: () => void;
  saleInvoiceEditingId: number | null;
}

export default function SaleInvoice({
  onClose,
  saleInvoiceEditingId = null,
}: SaleInvoiceProps) {
  const { t } = useTranslation();

  const [customerId, setCustomerId] = useState<number | null>(1);
  const [productId, setProductId] = useState<number | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [priceHelperDescription, setPriceHelperDescription] = useState("");
  const defaultCurrency = useCurrencyStore((state) => state.defaultCurrency);

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [
    selectedRowOfPurchaseInvoiceItems,
    setSelectedRowOfPurchaseInvoiceItems,
  ] = useState<number[]>([]);

  const [invoiceNumber, setInvoiceNumber] = useState<number | null>(null);
  const [salesInvoiceItems, setSalesInvoiceItems] = useState<InvoiceItem[]>([]);
  const [currencyRateId, setCurrencyRateId] = useState<number | null>(null);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [totalRemainingQuantity, setTotalRemainingQuantity] =
    useState<number>(0);
  const [suggestedUnitPrice, setSuggestedUnitPrice] = useState(0);
  const [saleUnitPrice, setSaleUnitPrice] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [amountReceived, setAmountReceived] = useState<number | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [helperDescription, setHelperDescription] = useState("");
  const [saleInvoiceError, setSaleInvoiceError] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithRelations | null>(null);

  const [
    totalSaleInvoicePriceDescription,
    setTotalSaleInvoicePriceDescription,
  ] = useState("");

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const data = await getCustomers();
      const anonymous = data?.find((customer) => customer.isAnonymous);
      if (data && anonymous) {
        setCustomerId(anonymous.id);
        setSelectedCustomer(anonymous);
      }
      return data;
    },
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
        //todo get last rate from store and set it
        setCurrencyRateId(data[data.length - 1].latestRateId);
      }
      return data;
    },
  });

  const {
    data: categoriesWithProducts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categoriesWithProducts"],
    queryFn: getCategoriesWithProducts,
  });

  const {
    data: purchaseInvoiceItemsForProduct = [],
    isLoading: isLoadingPurchaseInvoiceItemsForProduct,
    isError: isErrorPurchaseInvoiceItemsForProduct,
  } = useQuery({
    queryKey: ["PurchaseInvoiceItemsForProduct", productId],
    queryFn: async () => {
      const data = await getPurchaseInvoiceItemsForProduct(productId!);
      console.log("getPurchaseInvoiceItemsForProduct", data);
      return data;
    },
    enabled: !!productId,
  });

  const onCreateSaleInvoice = () => {
    const currency = currenciesWithLastRate.find(
      (currencyWithLastRate) =>
        currencyWithLastRate.latestRateId == currencyRateId,
    );
    if (
      currency === undefined ||
      currency.latestRate === null ||
      amountReceived === null
    ) {
      return;
    }

    const amount = +(amountReceived / currency.latestRate).toFixed(2);

    const data = {
      invoice: {
        customerId: customerId!,
        currencyRateId: currencyRateId!,
        invoiceNumber: new Date().toISOString(),
        invoiceDate: invoiceDate,
        totalPrice: totalPrice!,
        createdAt: new Date().toISOString(),
      },
      items: salesInvoiceItems,
      payment: {
        amount: amountReceived,
        currencyRateAmount: amount,
        currencyRateId: currencyRateId!,
        referenceNumber: referenceNumber,
      },
    };
    setSaleInvoiceError("");
    const regex = /^1[34]\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (salesInvoiceItems.length <= 0) {
      setSaleInvoiceError(t("validationSalesInvoiceItems"));
    } else if (!regex.test(invoiceDate)) {
      setSaleInvoiceError(t("validationInvoiceDate"));
    } else if (totalPrice === null) {
      setSaleInvoiceError(t("validationTotalPrice"));
    } else if (amountReceived === null) {
      setSaleInvoiceError(t("validationAmountReceived"));
    } else if (
      totalPrice &&
      amountReceived &&
      selectedCustomer?.isAnonymous &&
      totalPrice > amount
    ) {
      setSaleInvoiceError(t("validationReceivedAmountLessThanInvoice"));
    } else {
      console.log(data);
      createMutation.mutate(data);
    }
    console.log(data);
  };

  const createMutation = useMutation({
    mutationFn: createSaleInvoice,
    onSuccess: async () => {
      toast.success(t("validationSuccess"), { position: "bottom-center" });
      resetForm();
      onClose();
    },

    onError: (error) => {
      console.error(error);

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // فقط عدد
    if (value.length > 8) value = value.slice(0, 8);

    if (value.length >= 5) {
      value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    } else if (value.length >= 4) {
      value = `${value.slice(0, 4)}-${value.slice(4)}`;
    }

    setInvoiceDate(value);
  };

  const resetForm = () => {
    setEditingId(null);
    setProductId(null);
    setQuantity(0);
    setSaleUnitPrice(null);
    setError("");
    setDialogDeleteOpen(false);
    setOpen(false);
  };

  useEffect(() => {
    if (productId !== null && quantity !== null && saleUnitPrice !== null) {
      const total = quantity * saleUnitPrice;
      setHelperDescription(
        `قیمت فروش کل  : ${total.toLocaleString("en-US")} ${defaultCurrency?.name}  ، معادل  ${WordifyFa(total)} ${defaultCurrency?.name}   میباشد`,
      );
    } else {
      setHelperDescription("قیمت فروش محاسبه نشده است");
    }
  }, [quantity, productId, saleUnitPrice]);

  useEffect(() => {
    const currency = currenciesWithLastRate.find(
      (currencyWithLastRate) =>
        currencyWithLastRate.latestRateId == currencyRateId,
    );

    if (currency && currency.latestRate && salesInvoiceItems.length > 0) {
      const total = salesInvoiceItems.reduce(
        (sum, salesInvoiceItem) => sum + salesInvoiceItem.lineTotal,
        0,
      );
      let newTotal = total / currency.latestRate;
      newTotal = +newTotal.toFixed(2);

      setTotalPrice(newTotal);
      setTotalSaleInvoicePriceDescription(
        `قیمت فروش کل  : ${total.toLocaleString("en-US")} ${defaultCurrency?.name}  ، معادل  ${newTotal.toLocaleString()} ${currency.name}  میباشد`,
      );
    } else {
      setTotalSaleInvoicePriceDescription("قیمت فروش محاسبه نشده است");
    }
  }, [salesInvoiceItems]);

  const onSelectedCustomer = (customerId: number) => {
    const customer = customers.find((customer) => customer.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
    }
  };

  useEffect(() => {
    if (productId !== null && quantity !== null) {
      const selectedRows = [];
      let remainingQuantity = quantity;

      for (const item of purchaseInvoiceItemsForProduct) {
        if (remainingQuantity <= 0) break;

        selectedRows.push(item.id);

        remainingQuantity -= item.remainingQuantity;
      }
      setSelectedRowOfPurchaseInvoiceItems(selectedRows);
    } else {
      setSelectedRowOfPurchaseInvoiceItems([]);
    }
  }, [quantity, productId]);

  useEffect(() => {
    const currency = currenciesWithLastRate.find(
      (currencyWithLastRate) =>
        currencyWithLastRate.latestRateId == currencyRateId,
    );
    const profitPercent = selectedCustomer?.customProfitPercent
      ? selectedCustomer?.customProfitPercent
      : selectedCustomer?.customerType?.profitPercent;
    const totalPrice =
      purchaseInvoiceItemsForProduct[purchaseInvoiceItemsForProduct.length - 1]
        ?.totalPrice;
    console.log("aaaaaaaa");
    console.log(selectedCustomer);
    console.log(currency);
    console.log(totalPrice);
    console.log(profitPercent);
    console.log(currency?.latestRate);
    console.log(productId);
    if (
      selectedCustomer &&
      currency &&
      totalPrice &&
      profitPercent &&
      currency?.latestRate !== null &&
      productId !== null
    ) {
      const suggestedUnitPrice =
        totalPrice * (1 + profitPercent / 100) * currency.latestRate;
      setSuggestedUnitPrice(suggestedUnitPrice);
      setPriceHelperDescription(
        `قیمت فروش هر واحد : ${suggestedUnitPrice.toLocaleString("en-US")} ${defaultCurrency?.name}   میباشد`,
      );
    } else {
      setPriceHelperDescription("قیمت فروش محاسبه نشده است");
    }

    setTotalRemainingQuantity(
      purchaseInvoiceItemsForProduct.reduce(
        (sum, lot) => sum + lot.remainingQuantity,
        0,
      ),
    );
  }, [purchaseInvoiceItemsForProduct]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{t("saleInvoiceDescription")}</p>
        </div>

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
                {t("deletePurchaseItemsDescription", { name: invoiceDate })}
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

      {/* {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )} */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="saleInvoice-customer" className="text-sm font-medium">
            {t("customer")}
          </label>

          <select
            id="saleInvoice-customer"
            value={customerId?.toString() ?? ""}
            defaultValue={customerId?.toString() ?? ""}
            onChange={(event) => {
              setCustomerId(+event.target.value);
              onSelectedCustomer(+event.target.value);
            }}
            disabled={createMutation.isPending || isLoadingCustomers}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">
              {isLoadingCustomers ? t("loading") : t("selectCustomer")}
            </option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="sale-invoiceDate" className="text-sm font-medium">
            {t("purchaseInvoiceDate")}
          </label>

          <input
            id="sale-invoiceDate"
            value={invoiceDate}
            placeholder="1405-01-01"
            onChange={handleDateChange}
            disabled={createMutation.isPending}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-2 max-h-25 overflow-y-auto">
          <p className=" ">{t("selectCurrencyRate")}</p>
          {currenciesWithLastRate.map((currency) => (
            <div key={currency.id}>
              <p
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2 rounded-3xl px-2",
                  currencyRateId === currency.latestRateId &&
                    "bg-accent/60 text-accent-foreground",
                )}

                onClick={() => setCurrencyRateId(currency.latestRateId)}
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{t("saleInvoiceDescription")}</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(onOpen: boolean) =>
            onOpen ? setOpen(onOpen) : resetForm()
          }
        >
          <DialogTrigger asChild>
            {!!!saleInvoiceEditingId && (
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                {t("addSaleItem")}
              </Button>
            )}
          </DialogTrigger>

          <DialogContent className=" sm:max-w-2xl">
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
                    quantity: z
                      .number()
                      .min(1)
                      .max(totalRemainingQuantity, "موجودی محصول کم است"),
                    saleUnitPrice: z.number().min(1),
                  })
                  .safeParse({
                    productId,
                    quantity,
                    saleUnitPrice,
                  });

                if (!result.success) {
                  setError(
                    result.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
                  );
                  return;
                }
                if (!purchaseInvoiceItemsForProduct.length) {
                  setError("موجودی محصول کم است");
                  return;
                }
                const isBeforeAdded = salesInvoiceItems.findIndex(
                  (salesInvoice) =>
                    salesInvoice.productId === result.data.productId,
                );
                if (isBeforeAdded !== -1 && !editingId) {
                  setError("این محصول قبلا به فاکتور اضافه شده است");
                  return;
                }

                setError("");
                const newInvoiceItem: InvoiceItem = {
                  id: Date.now(),
                  productId: result.data.productId,
                  product: product!,
                  suggestedUnitPrice: suggestedUnitPrice,
                  quantity: result.data.quantity,
                  saleUnitPrice: result.data.saleUnitPrice,
                  salesInvoiceId: 0,
                  lineTotal: result.data.quantity * result.data.saleUnitPrice,
                  selectedRowOfPurchaseInvoiceItems:
                    selectedRowOfPurchaseInvoiceItems,
                  createdAt: new Date().toISOString(),
                };
                if (editingId) {
                  setSalesInvoiceItems((salesInvoiceItem) => {
                    const index = salesInvoiceItem.findIndex(
                      (p) => p.id === editingId,
                    );

                    if (index === -1) return salesInvoiceItem;

                    const newSalesInvoiceItem = [...salesInvoiceItem];
                    newSalesInvoiceItem[index] = {
                      ...newSalesInvoiceItem[index],
                      productId: result.data.productId,
                      product: product!,
                      quantity: result.data.quantity,
                      saleUnitPrice: result.data.saleUnitPrice,
                    };

                    return newSalesInvoiceItem;
                  });
                } else {
                  setSalesInvoiceItems([...salesInvoiceItems, newInvoiceItem]);
                }
                resetForm();
              }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <ProductCombobox
                    value={productId}
                    onValueChange={(productId, product) => {
                      setProductId(productId);
                      setProduct(product);
                    }}
                    items={categoriesWithProducts}
                    label={t("selectProduct")}
                  />
                  <div className="space-y-2">
                    <label
                      htmlFor="saleInvoice-type-name"
                      className="text-sm font-medium"
                    >
                      {t("quantity")}
                    </label>

                    <input
                      id="saleInvoice-type-name"
                      value={quantity?.toString()}
                      onChange={(event) => setQuantity(+event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                    {quantity > totalRemainingQuantity && (
                      <p className="text-xs text-destructive">
                        تعداد نمیتواند بزرگتر از مجموع باشد
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 h-48">
                  <p className=" ">{t("productInventory")}</p>
                  <div className="rounded-md border bg-background h-32 p-2">
                    {purchaseInvoiceItemsForProduct.length === 0 && (
                      <p className="h-32 text-center content-center">
                        محصولی یافت نشد
                      </p>
                    )}
                    {!!purchaseInvoiceItemsForProduct.length && (
                      <div>
                        <div className="grid grid-cols-[1fr_2fr_2fr_2fr] gap-4 border-b   ">
                          <div>{t("select")}</div>
                          <div>{t("purchaseInvoiceNumber")}</div>
                          <div>{t("remainingQuantity")}</div>
                          <div>{t("totalPrice")}</div>
                        </div>
                        {purchaseInvoiceItemsForProduct.map(
                          (purchaseInvoiceItem) => {
                            const isSelected =
                              selectedRowOfPurchaseInvoiceItems.includes(
                                purchaseInvoiceItem.id,
                              );

                            return (
                              <div
                                key={purchaseInvoiceItem.id}
                                className="grid grid-cols-[1fr_2fr_2fr_2fr] gap-4 border-b "
                                style={{
                                  color: isSelected ? "#22c55e" : "#777",
                                }}
                              >
                                <div>
                                  {isSelected && (
                                    <CheckIcon className="size-3.5 shrink-0" />
                                  )}
                                </div>
                                <div>{purchaseInvoiceItem.invoiceNumber}</div>
                                <div>
                                  {purchaseInvoiceItem.remainingQuantity}
                                </div>
                                <div>
                                  {purchaseInvoiceItem.totalPrice.toFixed(2)}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-[1fr_2fr_2fr_2fr] gap-4  ">
                    <div>{t("total")}</div>
                    <div> </div>
                    <div>{totalRemainingQuantity}</div>
                    <div> </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="saleInvoice-type-profit-percent"
                    className="text-sm font-medium"
                  >
                    {t("unitPrice")}
                  </label>
                  <input
                    id="saleInvoice-type-profit-percent"
                    value={saleUnitPrice?.toLocaleString()}
                    onChange={(event) =>
                      setSaleUnitPrice(+event.target.value.replaceAll(",", ""))
                    }
                    disabled={createMutation.isPending}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  {saleUnitPrice && WordifyFa(saleUnitPrice)}{" "}
                  {defaultCurrency?.name}
                </div>
                <div className="space-y-2">
                  <p>قیمت پیشنهادی</p>
                  <p className="bg-alert-mix py-1 px-2  rounded-xl text-sm text-alert">
                    {priceHelperDescription}
                  </p>
                </div>
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
      </div>
      {!isLoading && !isError && salesInvoiceItems.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && salesInvoiceItems.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 font-medium">
            <div>{t("productName")}</div>
            <div>{t("quantity")}</div>
            <div>{t("unitPrice")}</div>
            <div>{t("total")}</div>
            <div>{t("actions")}</div>
          </div>

          {salesInvoiceItems.map((salesInvoiceItem) => (
            <div
              key={salesInvoiceItem.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{salesInvoiceItem.product.name}</div>
              <div>{salesInvoiceItem.quantity.toLocaleString("en-US")}</div>
              <div>
                {salesInvoiceItem.saleUnitPrice.toLocaleString("en-US")}
              </div>
              <div>
                {(
                  salesInvoiceItem.quantity * salesInvoiceItem.saleUnitPrice
                ).toLocaleString("en-US")}
              </div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(salesInvoiceItem.id);
                    setProductId(salesInvoiceItem.productId);
                    setSaleUnitPrice(salesInvoiceItem.saleUnitPrice);
                    setQuantity(salesInvoiceItem.quantity);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setEditingId(salesInvoiceItem.id);
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

      {totalSaleInvoicePriceDescription && (
        <p className="bg-helper-mix py-1 px-2.5 rounded-xl text-sm text-helper">
          {totalSaleInvoicePriceDescription}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="saleInvoice-amount_received"
            className="text-sm font-medium"
          >
            {t("amountReceived")}
          </label>
          <input
            id="saleInvoice-amount_received"
            value={amountReceived?.toLocaleString()}
            onChange={(event) =>
              setAmountReceived(+event.target.value.replaceAll(",", ""))
            }
            disabled={createMutation.isPending}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          {amountReceived && WordifyFa(amountReceived)} {defaultCurrency?.name}
          {totalPrice &&
            amountReceived &&
            selectedCustomer?.isAnonymous &&
            totalPrice > amountReceived && (
              <p className="text-xs text-destructive">
                {t("validationReceivedAmountLessThanInvoice")}
              </p>
            )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="saleInvoice-amount_received"
            className="text-sm font-medium"
          >
            {t("referenceNumber")}
          </label>
          <input
            id="saleInvoice-amount_received"
            value={referenceNumber}
            onChange={(event) => setReferenceNumber(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      {saleInvoiceError && (
        <p className="bg-destructive-mix py-1 px-2.5 rounded-xl text-sm text-destructive">
          {saleInvoiceError}
        </p>
      )}
      <div className="flex justify-start gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          {t("cancel")}
        </Button>
        {!!!saleInvoiceEditingId && (
          <Button
            disabled={createMutation.isPending}
            onClick={() => onCreateSaleInvoice()}
          >
            {createMutation.isPending ? t("loading") : t("createSaleInvoice")}
          </Button>
        )}
      </div>
    </div>
  );
}
