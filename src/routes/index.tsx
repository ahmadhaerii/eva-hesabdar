import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useTransition } from "react";
import { getProducts } from "@/actions/product";
import { useTranslation } from "react-i18next";
import { getCustomers } from "@/actions/customer";
import { getSaleInvoices } from "@/actions/sale";
import { getPurchaseInvoices } from "@/actions/purchase";
// **********************************************************************

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Laptop,
  MoreVertical,
  Smartphone,
  Wallet,
  Watch,
  Headphones,
  Package,
  CircleDollarSign,
  HeartCrack,
  Boxes,
  Receipt,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
} from "recharts";
import { getDashboardData, getLast12MonthsSales } from "@/actions/app";
import {
  DashboardData,
  Last12MonthsSales,
} from "@/database/repositories/app/app.repository";
import { useCurrencyStore } from "@/stores/currencyStore";

function myTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || payload == null || payload.length === 0) {
    return null;
  }
  const { t } = useTranslation();

  const entry = payload[0];
  const point = entry?.payload;
  const data = payload[0].payload;

  return (
    <div
      style={{
        border: "1px solid #d88488",
        backgroundColor: "#fff",
        color: "#18181b",
        padding: 10,
        borderRadius: 5,
        boxShadow: "1px 1px 2px #d88488",
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>
        {data.formattedMonth}: {entry?.value?.toLocaleString()}
      </p>
      <p style={{ margin: 0 }}>{point?.note}</p>
      <p style={{ margin: 0, borderTop: "1px dashed #f5f5f5" }}>
        {t("invoiceCount")} : {data.invoiceCount}
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  secondValue,
  description,
  icon: Icon = DollarSign,
  iconColor = "oklch(76.5% 0.177 163.223)",
  iconBackgroundColor = "oklch(20.6% 0.17 162.48)",
}: {
  title: string;
  value?: string;
  secondValue?: string;
  description: string;
  icon?: React.ElementType;
  iconColor?: string;
  iconBackgroundColor?: string;
}) {
  return (
    <Card className="border-white/[0.08] bg-[#171717] shadow-none">
      <CardContent className="p-6">
        <div
          className="mb-7 flex h-11 w-11 items-center justify-center rounded-md "
          style={{
            backgroundColor: iconBackgroundColor,
          }}
        >
          <Icon className="h-5 w-5 " style={{ color: iconColor }} />
        </div>

        <p className="text-base font-semibold text-white">{title}</p>

        <p className="mt-2 text-sm text-zinc-500">{description}</p>

        <p className="mt-1 text-lg font-semibold text-white">{value}</p>
        {secondValue && (
          <p className="mt-1 text-lg font-semibold text-orange-400">
            {secondValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function HomePage() {
  const { t } = useTranslation();
  const defaultCurrency = useCurrencyStore((state) => state.defaultCurrency);

  const [dashboardData, setDashboardData] = useState<
    | (DashboardData & {
        bestSellingProductObject: {
          productId: number;
          productName: string;
          totalSoldQuantity: number;
        };
        mostIndebted: {
          id: number;
          display_name: string;
          totalInvoices: number;
          totalPayments: number;
          debt: number;
        };
      })
    | undefined
  >(undefined);
  const [last12MonthsSales, setLast12MonthsSales] = useState<
    Last12MonthsSales | undefined
  >(undefined);
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[] | undefined>(
    [],
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      Promise.all([getDashboardData(), getLast12MonthsSales()]).then(
        ([dashboardData, last12MonthsSales]) => {
          dashboardData?.bestSellingProduct.toString();
          if (dashboardData) {
            console.log(dashboardData);
            setDashboardData({
              ...dashboardData,
              bestSellingProductObject: JSON.parse(
                dashboardData?.bestSellingProduct,
              ),
              mostIndebted: JSON.parse(dashboardData?.mostIndebted),
            });
          }

          setLast12MonthsSales(last12MonthsSales);
          console.log("last12MonthsSales", last12MonthsSales);
        },
      );
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-[1600px] p-5 md:p-8">
        {/* Header */}
        <header className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("dashboard")}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">{t("overview")}</p>
          </div>
        </header>

        {/* Profit cards */}
        <section className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-white">
                {t("products")}
              </p>

              <p className="mt-3 text-2xl font-bold">
                {dashboardData?.productsCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-white">{t("sales")}</p>

              <p className="mt-3 text-2xl font-bold">
                {dashboardData?.salesInvoicesCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-white">
                {t("purchases")}
              </p>

              <p className="mt-3 text-2xl font-bold">
                {dashboardData?.purchaseInvoicesCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-white">
                {t("customers")}
              </p>

              <p className="mt-3 text-2xl font-bold">
                {dashboardData?.customersCount}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Stats */}
        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title={t("totalItems")}
            description={t("totalItemsDescription")}
            value={dashboardData?.totalRemainingQuantity.toString()}
            icon={Package}
            iconColor="#00d492"
            iconBackgroundColor="#00bc7d20"
          />

          <StatCard
            title={t("bestSellers")}
            description={t("bestSellersDescription")}
            value={dashboardData?.bestSellingProductObject?.productName}
            icon={CircleDollarSign}
            iconColor="#00bcff"
            iconBackgroundColor="#00bcff25"
          />

          <StatCard
            title={t("mostIndebted")}
            description={t("mostIndebtedDescription")}
            value={dashboardData?.mostIndebted.display_name}
            secondValue={dashboardData?.mostIndebted.debt.toLocaleString()}
            icon={HeartCrack}
            iconColor="#ff2056"
            iconBackgroundColor="#ff205625"
          />

          <StatCard
            title={t("totalDebts")}
            description={t("totalDebtsDescription")}
            value="XXXX"
            iconColor="#ffb900"
            iconBackgroundColor="#ffb90025"
          />

          <StatCard
            title={t("stockRial")}
            description={t("stockRialDescription")}
            value={
              dashboardData?.totalInventoryValue.toLocaleString() +
              " " +
              defaultCurrency?.name
            }
            icon={Boxes}
            iconColor="#8188d3"
            iconBackgroundColor="#3f43bd25"
          />

          <StatCard
            title={t("stockValue")}
            description={t("stockValueDescription")}
            value={dashboardData?.totalInventoryValueInCurrency.toLocaleString()}
            icon={Receipt}
            iconColor="#c34e27"
            iconBackgroundColor="#c34e2725"
          />
        </section>

        {/* Main content */}
        <section className="grid gap-6 xl:grid-cols-[250px_250px_minmax(0,1fr)]">
          {/* Products */}
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">{t("products")}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/[0.04]">
                  <CreditCard className="h-5 w-5 text-zinc-300" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    لیست بدهکاران
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">شسیشسی</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/[0.04]">
                  <CreditCard className="h-5 w-5 text-zinc-300" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    لیست کالاهای راکد
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">شسی</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/[0.04]">
                  <CreditCard className="h-5 w-5 text-zinc-300" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    لیست مشتریان بی وفا
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">شسیشسی</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/[0.04]">
                  <CreditCard className="h-5 w-5 text-zinc-300" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    لیست کالاهای رو به اتمام
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">شسی</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Middle cards */}
          <div className="flex flex-col gap-4">
            <StatCard
              title={t("yearlySales")}
              description={t("yearlySalesDescription")}
              value={dashboardData?.currentYearSales.toLocaleString()}
            />
            <StatCard
              title={t("totalSales")}
              description={t("totalSalesDescription")}
              value={dashboardData?.allTimeSales.toLocaleString()}
            />
          </div>

          {/* Chart */}
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{t("monthlySales")}</CardTitle>

                <p className="mt-1 text-sm text-zinc-500">
                  {t("monthlySalesDescription")} :{" "}
                  {last12MonthsSales?.totalSales.toLocaleString()}
                </p>
              </div>

              <MoreVertical className="h-5 w-5 text-zinc-500" />
            </CardHeader>

            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={last12MonthsSales?.months}
                    margin={{
                      top: 25,
                      right: 5,
                      left: 5,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid vertical={false} stroke="transparent" />

                    <XAxis
                      dataKey="monthName"
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      cursor={{
                        fill: "rgba(255,255,255,0.03)",
                      }}
                      contentStyle={{
                        background: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      content={myTooltip}
                    />

                    <Bar
                      dataKey="totalSales"
                      radius={[10, 10, 10, 10]}
                      fill="#064e3b"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bottom reports */}
        <section className="mt-6 grid gap-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#171717] md:grid-cols-3">
          <div className="border-b border-white/[0.08] p-7 last:border-b-0 md:border-b-0  ">
            <h3 className="text-lg font-semibold">{t("report")}</h3>

            <p className="mt-1 text-sm text-zinc-500">
              {t("lastMonthTransactions")}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,673</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,673</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,673</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,673</strong>
            </div>
          </div>
          <div className="border-b border-white/[0.08] p-7 md:border-b-0 md:border-r md:border-l ">
            <h3 className="text-lg font-semibold">{t("transaction")}</h3>

            <p className="mt-1 text-sm text-zinc-500">{t("weeklyOverview")}</p>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,67311</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,67311</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,67311</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,67311</strong>
            </div>
          </div>
          <div className="border-b border-white/[0.08] p-7 last:border-b-0 md:border-b-0   ">
            <h3 className="text-lg font-semibold">{t("report")}</h3>

            <p className="mt-1 text-sm text-zinc-500">
              {t("lastMonthTransactions")}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,673</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,673</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,673</strong>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500 ">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>

                <span className="font-medium">{t("totalIncome")}</span>
              </div>

              <strong>$4,673</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
export const Route = createFileRoute("/")({
  component: HomePage,
});
