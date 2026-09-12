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

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  getCustomerTypes,
  listCustomersWithDebt,
  updateCustomer,
} from "@/actions/customer";
import CustomerType from "@/features/customers/customerType";

function CustomersPage() {
  const { t } = useTranslation();

  const {
    data: customers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
  const {
    data: customerTypes = [],
    isLoading: isLoadingCustomerTypes,
    isError: isErrorCustomerTypes,
  } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: getCustomerTypes,
  });

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [dialogCustomerTypeOpen, setDialogCustomerTypeOpen] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [customerTypeId, setCustomerTypeId] = useState<number | null>(null);
  const [customProfitPercent, setCustomProfitPercent] = useState<number | null>(
    0,
  );
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createCustomer,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
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
        displayName: string;
        description: string | null;
        nationalId: string | null;
        customerTypeId: number;
        customProfitPercent: number | null;
        phone: string | null;
        mobile: string | null;
        email: string | null;
        address: string | null;
        postalCode: string | null;
        isActive?: boolean;
        isAnonymous?: boolean;
      };
    }) => updateCustomer(id, data),

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

  const resetForm = () => {
    setEditingId(null);
    setDisplayName("");
    setDescription("");
    setNationalId("");
    setCustomerTypeId(null);
    setCustomProfitPercent(0);
    setPhone("");
    setMobile("");
    setEmail("");
    setAddress("");
    setPostalCode("");
    setIsAnonymous(false);

    setError("");
    setDialogDeleteOpen(false);
    setOpen(false);
    setDialogCustomerTypeOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("customers")}</h1>

          <p className="text-muted-foreground">{t("customerDescription")}</p>
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
                {t("addCustomer")}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t("editCustomer") : t("addCustomer")}
                </DialogTitle>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const result = z
                    .object({
                      displayName: z
                        .string()
                        .trim()
                        .min(1, "نام مشتری الزامی است ."),
                      description: z.string().trim(),
                      customProfitPercent: z.number(),
                      nationalId: z.string().trim(),
                      phone: z.string().trim(),
                      mobile: z.string().trim(),
                      email: z.string().trim(),
                      address: z.string().trim(),
                      postalCode: z.string().trim(),
                      isAnonymous: z.boolean(),
                      customerTypeId: z
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
                      displayName,
                      description,
                      customProfitPercent,
                      nationalId,
                      phone,
                      mobile,
                      email,
                      address,
                      postalCode,
                      customerTypeId,
                      isAnonymous,
                    });

                  if (!result.success) {
                    setError(
                      result.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
                    );
                    return;
                  }

                  setError("");
                  if (
                    result.data.customerTypeId === undefined ||
                    result.data.customerTypeId === null
                  )
                    return;
                  if (editingId) {
                    updateMutation.mutate({
                      id: editingId,
                      data: {
                        displayName: result.data.displayName,
                        description: result.data.description || null,
                        customProfitPercent:
                          result.data.customProfitPercent || null,
                        nationalId: result.data.nationalId || null,
                        phone: result.data.phone || null,
                        mobile: result.data.mobile || null,
                        email: result.data.email || null,
                        address: result.data.address || null,
                        postalCode: result.data.postalCode || null,
                        customerTypeId: result.data.customerTypeId,
                        isAnonymous: result.data.isAnonymous,
                      },
                    });
                  } else {
                    createMutation.mutate({
                      displayName: result.data.displayName,
                      description: result.data.description || null,
                      customProfitPercent:
                        result.data.customProfitPercent || null,
                      nationalId: result.data.nationalId || null,
                      phone: result.data.phone || null,
                      mobile: result.data.mobile || null,
                      email: result.data.email || null,
                      address: result.data.address || null,
                      postalCode: result.data.postalCode || null,
                      customerTypeId: result.data.customerTypeId,
                      isAnonymous: result.data.isAnonymous,
                    });
                  }
                }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="customer-displayName"
                      className="text-sm font-medium"
                    >
                      {t("customerName")}
                    </label>

                    <input
                      id="customer-displayName"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="customer-nationalId"
                      className="text-sm font-medium"
                    >
                      {t("customerNationalId")}
                    </label>

                    <input
                      id="customer-nationalId"
                      value={nationalId}
                      onChange={(event) => setNationalId(event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="customer-type"
                      className="text-sm font-medium"
                    >
                      {t("selectCustomerType")}
                    </label>

                    <select
                      id="customer-type"
                      value={customerTypeId?.toString() ?? ""}
                      onChange={(event) =>
                        setCustomerTypeId(+event.target.value)
                      }
                      disabled={
                        createMutation.isPending || isLoadingCustomerTypes
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">
                        {isLoadingCustomerTypes
                          ? t("loading")
                          : t("selectCustomerType")}
                      </option>

                      {customerTypes.map((customerType) => (
                        <option key={customerType.id} value={customerType.id}>
                          {customerType.name} ({customerType.profitPercent}{" "}
                          {t("percent")})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="customer-customProfitPercent"
                      className="text-sm font-medium"
                    >
                      {t("customProfitPercent")}
                    </label>

                    <input
                      id="customer-customProfitPercent"
                      value={customProfitPercent?.toString()}
                      onChange={(event) =>
                        setCustomProfitPercent(+event.target.value)
                      }
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="customer-phone"
                      className="text-sm font-medium"
                    >
                      {t("phone")}
                    </label>

                    <input
                      id="customer-phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="customer-mobile"
                      className="text-sm font-medium"
                    >
                      {t("mobile")}
                    </label>

                    <input
                      id="customer-mobile"
                      value={mobile}
                      onChange={(event) => setMobile(event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="customer-email"
                      className="text-sm font-medium"
                    >
                      {t("email")}
                    </label>

                    <input
                      id="customer-email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="customer-postalCode"
                      className="text-sm font-medium"
                    >
                      {t("postalCode")}
                    </label>

                    <input
                      id="customer-postalCode"
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor="customer-address"
                      className="text-sm font-medium"
                    >
                      {t("address")}
                    </label>

                    <input
                      id="customer-address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
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

                  <div className="flex items-center gap-2">
                    <input
                      id="product-active"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(event) => setIsAnonymous(event.target.checked)}
                      disabled={createMutation.isPending}
                    />

                    <label
                      htmlFor="product-active"
                      className="text-sm font-medium"
                    >
                      {t("isAnonymous")}
                    </label>
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
            open={dialogCustomerTypeOpen}
            onOpenChange={(onOpen: boolean) =>
              onOpen ? setDialogCustomerTypeOpen(onOpen) : resetForm()
            }
          >
            <DialogTrigger asChild>
              <Button className="ms-2">
                <UserCog className="ml-2 h-4 w-4" />
                {t("manageCustomerType")}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{t("manageCustomerType")}</DialogTitle>
              </DialogHeader>
              <CustomerType />
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
              <p>{t("deleteCustomerDescription", { name: displayName })}</p>
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
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-4 border-b p-4 font-medium">
            <div>{t("customerName")}</div>
            <div>{t("customerType")}</div>
            <div>{t("customerProfitPercent")}</div>
            <div>{t("customerDescription")}</div>
            <div>{t("status")}</div>
            <div>{t("actions")}</div>
          </div>

          {customers.map((customer) => (
            <div
              key={customer.id}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{customer.displayName}</div>
              <div>{customer.customerType?.name}</div>
              <div>
                {customer.customProfitPercent
                  ? customer.customProfitPercent
                  : customer.customerType?.profitPercent}
              </div>

              <div className="text-muted-foreground">
                {customer.description || "—"}
              </div>

              <div>{customer.isActive ? t("active") : t("inactive")}</div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingId(customer.id);
                    setDisplayName(customer.displayName);
                    setDescription(customer.description ?? "");
                    setCustomerTypeId(customer.customerTypeId ?? "");
                    setNationalId(customer.nationalId ?? "");
                    setCustomProfitPercent(customer.customProfitPercent ?? 0);
                    setPhone(customer.phone ?? "");
                    setMobile(customer.mobile ?? "");
                    setEmail(customer.email ?? "");
                    setAddress(customer.address ?? "");
                    setPostalCode(customer.postalCode ?? "");
                    setIsAnonymous(customer.isAnonymous);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setDisplayName(customer.displayName);
                    setEditingId(customer.id);
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

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});
