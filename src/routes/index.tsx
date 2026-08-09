import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useTransition } from "react";
import { getAppVersion, getPlatform } from "@/actions/app";
import { getProducts } from "@/actions/product";

function HomePage() {
  const [appVersion, setAppVersion] = useState("...");
  const [products, setProducts] = useState<any[] | undefined>([]);
  const [platform, setPlatform] = useState("...");
  const [, startTransition] = useTransition();
  useEffect(() => {
    startTransition(() => {
      Promise.all([getProducts(), getAppVersion(), getPlatform()]).then(
        ([products, version, currentPlatform]) => {
          setProducts(products);
          setAppVersion(version);
          setPlatform(currentPlatform);
        },
      );
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your business system
        </p>
      </div>

      {/* System Information */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Application</p>

          <p className="mt-2 text-xl font-semibold">ERP</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Version</p>

          <p className="mt-2 text-xl font-semibold">{appVersion}</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Platform</p>

          <p className="mt-2 text-xl font-semibold">{platform}</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Database</p>

          <p className="mt-2 text-xl font-semibold">libSQL</p>
        </div>
      </div>

      {/* Business Overview */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Business Overview</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Products"
            value={products ? products.length.toString() : "0"}
          />

          <DashboardCard title="Customers" value="—" />

          <DashboardCard title="Inventory" value="—" />

          <DashboardCard title="Sales" value="—" />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>

      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
