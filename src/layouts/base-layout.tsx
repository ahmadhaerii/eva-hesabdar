import type React from "react";
import { Link } from "@tanstack/react-router";
import DragWindowRegion from "@/components/drag-window-region";
import ToggleTheme from "@/components/toggle-theme";
import LangToggle from "@/components/lang-toggle";
import { useTranslation } from "react-i18next";

const navigation = [
  {
    label: "Dashboard",
    to: "/",
  },
  {
    label: "Products",
    to: "/products",
  },
  {
    label: "Categories",
    to: "/categories",
  },
  {
    label: "Customers",
    to: "/customers",
  },
  {
    label: "Payments",
    to: "/payments",
  },
  {
    label: "Purchases",
    to: "/purchases",
  },
  {
    label: "Sales",
    to: "/sales",
  },
  {
    label: "Inventory",
    to: "/inventory",
  },
  {
    label: "Units",
    to: "/units",
  },
  {
    label: "Currencies",
    to: "/currencyRates",
  },
  {
    label: "Settings",
    to: "/settings",
  },
] as const;

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="h-screen overflow-hidden bg-background">
      <DragWindowRegion title="electron-shadcn" />

      <div className="flex h-[calc(100vh-2rem)]">
        {/* Sidebar */}
        <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
          {/* Brand */}
          <div className="flex h-14 items-center border-b px-5">
            <div>
              <h1 className="text-base font-semibold">ERP</h1>

              <p className="text-xs text-muted-foreground">{t("categories")}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
                inactiveProps={{
                  className:
                    "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                }}
                className="block rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {t(item.label.toLowerCase())}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t p-3">
            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-xs font-medium">Local Database</p>

              <p className="mt-0.5 text-xs text-muted-foreground">libSQL</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-6">
            <div>
              <h2 className="text-sm font-medium">Dashboard</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Admin</span>
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                A
              </div>
              <LangToggle />
              <ToggleTheme />
            </div>
          </header>

          {/* Page Content */}
          <main className="min-h-0 flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
