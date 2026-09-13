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
import { useCurrencyStore } from "@/stores/currencyStore";
import { listCurrenciesWithLastRate } from "@/actions/currency";
import { CurrencyWithRate } from "@/database/repositories/currency/currency.repository";

export function DebtCustomers() {
  const { t } = useTranslation();
  const defaultCurrency = useCurrencyStore((state) => state.defaultCurrency);
  const [currency, setCurrency] = useState<CurrencyWithRate | undefined>(
    undefined,
  );

  const {
    data: customers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: listCustomersWithDebt,
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
        const cu = data.find((cu) => !cu.isBase);
        setCurrency(cu);
      }
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("debtCustomersList")}</h1>
        </div>
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
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr] gap-4 border-b p-4 font-medium">
            <div>{t("customerName")}</div>
            <div>{t("mobile")}</div>
            <div>{t("sumSalePurchase")}</div>
            <div>{t("received")}</div>
            <div>{t("debtRateAmount")}</div>
            <div>{t("debt")}</div>
          </div>

          {customers.map((customer) => (
            <div
              key={customer.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{customer.displayName}</div>
              <div>{customer.mobile}</div>
              <div>{customer.totalInvoices?.toLocaleString()}</div>
              <div>{customer.totalPayments?.toLocaleString()}</div>
              <div>
                {customer.debt?.toLocaleString()} {currency?.name}
              </div>
              <div>
                {currency && currency.latestRate
                  ? Math.round(
                      customer.debt * currency.latestRate,
                    ).toLocaleString()
                  : 0}{" "}
                {defaultCurrency?.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
