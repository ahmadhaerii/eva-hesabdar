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
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { getDashboardData, getLast12MonthsSales } from "@/actions/app";

const transactionData = [
  { month: "مهر", value: 38 },
  { month: "آبان", value: 52 },
  { month: "آذر", value: 32 },
  { month: "دی", value: 12 },
  { month: "بهمن", value: 35 },
  { month: "اسفند", value: 28 },
  { month: "فروردین", value: 25 },
  { month: "اردبهشت", value: 25 },
  { month: "خرداد", value: 28 },
  { month: "تیر", value: 33 },
  { month: "مرداد", value: 25 },
  { month: "شهریور", value: 25 },
];
const CustomXAxisTick = ({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        transform="rotate(-45)"
        textAnchor="end"
        direction="rtl"
        unicodeBidi="plaintext"
        fill="#71717a"
        fontSize={12}
        dx={-5}
        dy={10}
      >
        {payload?.value}
      </text>
    </g>
  );
};
const products = [
  {
    name: "Samsung Galaxy S25",
    brand: "Samsung",
    icon: Smartphone,
    color: "blue",
  },
  {
    name: "Apple MacBook Pro",
    brand: "Apple",
    icon: Laptop,
    color: "green",
  },
  {
    name: "Sony WH-1000XM4",
    brand: "Sony",
    icon: Headphones,
    color: "red",
  },
  {
    name: "Dell XPS 13",
    brand: "Dell",
    icon: Laptop,
    color: "gray",
  },
  {
    name: "Smart Band 4",
    brand: "Xiaomi",
    icon: Watch,
    color: "yellow",
  },
];

function StatCard({
  title,
  value,
  description,
  icon: Icon = DollarSign,
}: {
  title: string;
  value: string;
  description: string;
  icon?: React.ElementType;
}) {
  return (
    <Card className="border-white/[0.08] bg-[#171717] shadow-none">
      <CardContent className="p-6">
        <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>

        <p className="text-base font-semibold text-white">{title}</p>

        <p className="mt-2 text-sm text-zinc-500">{description}</p>

        <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function ReportCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-white/[0.08] bg-[#171717] shadow-none">
      <CardContent className="p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-500/10">
            <Wallet className="h-5 w-5 text-emerald-400" />
          </div>

          <div>
            <p className="text-sm text-zinc-500">This week</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HomePage() {
  const { t } = useTranslation();

  const [products1, setProducts1] = useState<any[] | undefined>([]);
  const [customers, setCustomers] = useState<any[] | undefined>([]);
  const [saleInvoices, setSaleInvoices] = useState<any[] | undefined>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[] | undefined>(
    [],
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      Promise.all([getDashboardData(), getLast12MonthsSales()]).then(
        ([dddd, xxxx]) => {
          console.log("dddd", dddd);
          console.log("xxxx", xxxx);
        },
      );
    });
  }, []);

  // const isRTL = true;
  // const t1 = {
  //   dashboard: isRTL ? "داشبورد" : "Dashboard",
  //   overview: isRTL
  //     ? "مروری بر سیستم کسب‌وکار شما"
  //     : "Overview of your business system",

  //   profit: isRTL ? "سود" : "Profit",

  //   totalIncome: isRTL ? "درآمد کل" : "Total Income",
  //   totalExpense: isRTL ? "هزینه کل" : "Total Expense",

  //   lastWeek: isRTL ? "هفته گذشته" : "Last week",
  //   lastMonth: isRTL ? "ماه گذشته" : "Last month",

  //   products: isRTL ? "محصولات برتر بر اساس فروش" : "Top Products by Sales",

  //   thisWeek: isRTL ? "این هفته" : "This week",

  //   transaction: isRTL ? "تراکنش‌های کل" : "Total Transaction",

  //   weeklyOverview: isRTL ? "نمای هفتگی" : "Weekly overview",

  //   report: isRTL ? "گزارش" : "Report",

  //   lastMonthTransactions: isRTL
  //     ? "تراکنش‌های ماه گذشته $23.4K"
  //     : "Last month transactions $23.4K",

  //   language: isRTL ? "English" : "فارسی",
  // };

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

              <p className="mt-3 text-2xl font-bold">{products.length}</p>
            </CardContent>
          </Card>
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-white">{t("sales")}</p>

              <p className="mt-3 text-2xl font-bold">{saleInvoices?.length}</p>
            </CardContent>
          </Card>
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-white">
                {t("purchases")}
              </p>

              <p className="mt-3 text-2xl font-bold">
                {purchaseInvoices?.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-white">
                {t("customers")}
              </p>

              <p className="mt-3 text-2xl font-bold">{customers?.length}</p>
            </CardContent>
          </Card>
        </section>

        {/* Stats */}
        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title={t("totalItems")}
            description={t("totalItemsDescription")}
            value="$4,673"
          />

          <StatCard
            title={t("bestSellers")}
            description={t("bestSellersDescription")}
            value="$4,673"
          />

          <StatCard
            title={t("mostIndebted")}
            description={t("mostIndebtedDescription")}
            value="$4,673"
          />

          <StatCard
            title={t("totalDebts")}
            description={t("totalDebtsDescription")}
            value="$4,673"
          />

          <StatCard
            title={t("stockRial")}
            description={t("stockRialDescription")}
            value="$4,673"
          />

          <StatCard
            title={t("totalExpense")}
            description={t("lastMonth")}
            value="$1.28K"
            icon={CreditCard}
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
              value="123123123"
            />
            <StatCard
              title={t("totalSales")}
              description={t("totalSalesDescription")}
              value="123123123123123123123"
            />
          </div>

          {/* Chart */}
          <Card className="border-white/[0.08] bg-[#171717] shadow-none">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{t("monthlySales")}</CardTitle>

                <p className="mt-1 text-sm text-zinc-500">
                  {t("monthlySalesDescription")}
                </p>
              </div>

              <MoreVertical className="h-5 w-5 text-zinc-500" />
            </CardHeader>

            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transactionData}
                    margin={{
                      top: 25,
                      right: 5,
                      left: 5,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid vertical={false} stroke="transparent" />

                    <XAxis dataKey="month" axisLine={false} tickLine={false} />

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
                    />

                    <Bar
                      dataKey="value"
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
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10">
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
