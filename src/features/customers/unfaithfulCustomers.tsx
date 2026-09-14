import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listCustomersWithLastOrderDate } from "@/actions/customer";
import CustomerType from "@/features/customers/customerType";
import { useCurrencyStore } from "@/stores/currencyStore";
import { listCurrenciesWithLastRate } from "@/actions/currency";
import { CurrencyWithRate } from "@/database/repositories/currency/currency.repository";
import { daysSinceLastOrder } from "@/utils/dateUtils";

export function UnfaithfulCustomers() {
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
    queryFn: listCustomersWithLastOrderDate,
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
          <h1 className="text-2xl font-semibold">
            {t("unfaithfulCustomersList")}
          </h1>
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
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr_1fr] gap-4 border-b p-4 font-medium">
            <div>{t("customerName")}</div>
            <div>{t("mobile")}</div>
            <div>{t("sumSalePurchase")}</div>
            <div>{t("received")}</div>
            <div>{t("debtRateAmount")}</div>
            <div>{t("debt")}</div>
            <div>{t("lastOrderDate")}</div>
          </div>

          {customers.map((customer) => (
            <div
              key={customer.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr_1fr] gap-4 border-b p-4 last:border-b-0"
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
              <div>
                {daysSinceLastOrder(customer.lastOrderDate)} {t("dayBefore")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
