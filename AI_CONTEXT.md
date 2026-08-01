# AI Project Context
Version: 1.0

---

# Project Name

Accounting Software

---

# Goal

Develop a desktop accounting/inventory application using Electron.

The project is NOT a generic accounting software.

It is designed for an import business where:

- Purchases are made using foreign currencies.
- Sales are made only in IRR.
- Product selling price is calculated dynamically.
- Currency conversion differences are tracked.

---

# Technology Stack

Electron Forge
React 19
TypeScript
TailwindCSS
shadcn/ui
TanStack Router
oRPC
SQLite
Drizzle ORM
Zod

---

# Development Style

The assistant acts as:

Software Architect

NOT just a code generator.

Every feature must be developed in this order:

1. Business Analysis
2. Architecture
3. Database
4. Services
5. API
6. UI
7. Implementation
8. Testing

Never jump directly to coding.

---

# Project Modules (Version 1)

Dashboard

Customers

Products

Inventory

Purchase

Sales

Currencies

Reports

Settings

---

# Business Rules

## Base Currency

System base currency is IRR.

---

## Purchases

Purchases can be made in any currency.

Examples:

AED

USD

EUR

Every purchase stores its own currency rate.

Changing future currency rates must NOT affect previous purchases.

---

## Sales

Sales are always recorded in IRR.

---

## Product Pricing

Products DO NOT have fixed prices.

Products DO NOT store:

Purchase Price

Sale Price

Currency

Barcode

Minimum Stock

Prices belong to purchase lots.

---

## Freight

Freight belongs to the purchase invoice.

Freight is equally distributed between purchased items.

Final Cost =

Purchase Price

+

Allocated Freight

---

## Customer Types

Customer Type determines profit percentage.

Example:

Wholesale → 10%

Retail → 20%

Partner → 15%

---

## Suggested Price Formula

Suggested Price =

(Final Cost Currency)

×

Today's Currency Rate

×

Customer Profit

Example:

Purchase Price = 1000 AED

Freight = 100 AED

Final Cost = 1100 AED

Today's AED = 2000 IRR

Customer Profit = 20%

1100 × 2000 = 2,200,000

2,200,000 × 1.20 = 2,640,000

---

## Actual Sale Price

User is ALWAYS allowed to override the suggested price.

The system should only warn when the difference is large.

Never block the sale.

Store:

SuggestedPrice

ActualPrice

Difference

inside SalesInvoiceItems.

---

## Inventory

There is only ONE warehouse.

Warehouse table is unnecessary.

Inventory is calculated from transactions.

Never store stock inside Product.

Inventory uses FIFO.

Each purchase creates one LOT.

---

## FIFO

Each purchase item creates one inventory lot.

Example:

Lot A

20 Qty

1100 AED

Lot B

15 Qty

1250 AED

Sales always consume the oldest lot first.

---

## Currency Conversion

Currency conversion is an independent process.

It is NOT attached to sales invoices.

The system tracks:

Source Amount

Expected Currency

Actual Currency

Difference

Example:

50,000,000 IRR

↓

Expected:

200 AED

↓

Actual:

180 AED

↓

Difference:

20 AED

---

# Database Tables

Customers

CustomerTypes

Products

Categories

PurchaseInvoices

PurchaseInvoiceItems

InventoryLots

InventoryTransactions

SalesInvoices

SalesInvoiceItems

Currencies

CurrencyRates

CurrencyConversions

Settings

---

# Database Principles

Never store calculated values unless historical tracking requires it.

Separate Business Logic from UI.

Services perform calculations.

Database stores facts.

---

# Core Services

PriceCalculator

InventoryService

FIFOService

CurrencyService

ConversionService

PurchaseService

SalesService

---

# UI Principles

Modern desktop application.

Simple.

Fast.

Professional.

No unnecessary dialogs.

Keyboard-friendly.

Dark mode supported.

---

# Future Features

Users

Permissions

Accounting

Cash

Banks

Printing

Backup

Multi Company

---

# Things Already Decided

✓ SQLite

✓ Drizzle ORM

✓ Electron

✓ FIFO

✓ Single Warehouse

✓ Sales in IRR

✓ Purchases in Foreign Currency

✓ Dynamic Suggested Price

✓ User can override selling price

✓ Freight equally distributed

✓ Currency conversion module

✓ Customer types define profit

---

# Assistant Instructions

Always continue from this architecture.

Do not redesign the project unless explicitly requested.

When suggesting database changes:

Keep backward compatibility.

Prefer scalable architecture.

Always explain architectural decisions before coding.

Act as a senior software architect.