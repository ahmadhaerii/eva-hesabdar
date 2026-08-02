# Project Context

This project is an Electron desktop accounting application built on:

- Electron Forge
- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- shadcn/ui
- TailwindCSS v4
- SQLite
- Drizzle ORM (implementation not started yet)

The current phase is **Database Design**.
No code has been written yet.

---

# Project Scope (Version 1.0)

Modules:

- Contacts
- Products
- Purchases
- Inventory
- Sales
- Reports
- Settings
- Currencies

No banking module.
No accounting journal.
No permissions.
No users.
No multi warehouse.

---

# Business Rules

Base currency = IRR.

Purchases are usually made in foreign currencies (AED, USD, EUR).

Sales are always in IRR.

Exchange rates are entered manually.

Exchange rates are immutable.

Each rate insertion creates a new record.

Only one active rate exists per currency.

The active rate is always the latest valid rate.

Sales use the active exchange rate.

After saving an invoice, exchange rates never affect previous invoices.

Invoices store exchange rate snapshots.

---

# Pricing Formula

Purchase Unit Cost
+ Freight Share
=
Final Unit Cost

Final Unit Cost
× Exchange Rate
× Customer Profit Percentage
=
Suggested Sale Price

User can override Suggested Sale Price.

System never blocks manual prices.

---

# Freight

Current Version:

Only Freight exists.

Freight is equally divided among all invoice items.

---

# Inventory

Single warehouse.

FIFO inventory.

Each purchase creates one Inventory Lot.

Inventory Lots keep:

- Initial Quantity
- Remaining Quantity
- Unit Cost

Inventory movements are stored separately.

---

# Currency Conversion

A dedicated Currency Conversion module exists.

Purpose:

Convert accumulated IRR into foreign currency.

Store:

Expected Amount

Actual Amount

Difference

This difference is later used for exchange gain/loss reporting.

---

# Database Tables

customer_types

contacts

customer_profiles

units

categories

products

currencies

currency_rates

purchase_invoices

purchase_invoice_items

purchase_costs

inventory_lots

inventory_transactions

sales_invoices

sales_invoice_items

sales_inventory_allocations

currency_conversions

settings

---

# Important Design Decisions

Soft Delete only for master tables.

Financial documents use Status instead of Delete.

Invoices are immutable snapshots.

No barcode.

No brands table.

Brand is part of Product Name.

No unit conversion.

One Product = One Unit.

One warehouse only.

No supplier module.

Contacts are used for all business parties.

Customer profile stores pricing profile.

Customer-specific profit percentage overrides customer type percentage.

SQLite INTEGER PRIMARY KEY AUTOINCREMENT is used everywhere.

Naming convention:

snake_case

Plural table names.

created_at / updated_at on all applicable tables.

deleted_at only on master tables.

No business logic inside UI.

Database design is finalized.

Next phase:

Drizzle Schema implementation.