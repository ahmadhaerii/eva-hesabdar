import { createFileRoute } from "@tanstack/react-router";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listCustomersWithLastOrderDate } from "@/actions/customer";
import CustomerType from "@/features/customers/customerType";
import { useCurrencyStore } from "@/stores/currencyStore";
import { listCurrenciesWithLastRate } from "@/actions/currency";
import { CurrencyWithRate } from "@/database/repositories/currency/currency.repository";
import { daysSinceLastOrder } from "@/utils/dateUtils";
import { inventorySummary } from "@/actions/product";

function InventoryComponent() {
  const { t } = useTranslation();
  const defaultCurrency = useCurrencyStore((state) => state.defaultCurrency);
  const [currency, setCurrency] = useState<CurrencyWithRate | undefined>(
    undefined,
  );

  const {
    data: inventorySummaries = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["inventorySummary"],
    queryFn: inventorySummary,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("inventory")}</h1>
        </div>
      </div>

      {isLoading && <div className="text-muted-foreground">{t("loading")}</div>}

      {isError && (
        <div className="text-destructive">دریافت داده ها با خطا مواجه شد.</div>
      )}

      {!isLoading && !isError && inventorySummaries.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      )}

      {!isLoading && !isError && inventorySummaries.length > 0 && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b p-4 font-medium">
            <div>{t("customerName")}</div>
            <div>{t("purchaseCount")}</div>
            <div>{t("saleCount")}</div>
            <div>{t("remainingQuantity")}</div>
          </div>

          {inventorySummaries.map((inventorySummary) => (
            <div
              key={inventorySummary.productId}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b p-4 last:border-b-0"
            >
              <div>{inventorySummary.productName}</div>
              <div>{inventorySummary.totalPurchased?.toLocaleString()}</div>
              <div>{inventorySummary.totalRemaining?.toLocaleString()}</div>
              <div>{inventorySummary.totalSoldOrUsed?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/inventory")({
  component: InventoryComponent,
});
