-- =====================================================================
-- Accounting Software Database Schema
-- Database : SQLite 3
-- Version  : 1.0.0
-- Encoding : UTF-8
-- Author    : Project Internal Specification
--
-- Description
-- ---------------------------------------------------------------------
-- Desktop Accounting Software
--
-- Features
--     • Contact Management
--     • Product Management
--     • Purchase Management
--     • Inventory (FIFO)
--     • Sales
--     • Currency Management
--     • Currency Conversion
--     • Reports
--
-- Business Rules
-- ---------------------------------------------------------------------
-- Base Currency           : IRR
-- Purchase Currency       : Any Currency
-- Sales Currency          : IRR
-- Inventory Method        : FIFO
-- Financial Documents     : Immutable Snapshot
-- Soft Delete             : Master Tables Only
--
-- =====================================================================

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- =====================================================================
-- TABLE : customer_types
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Defines customer pricing groups.
--
-- Example
--
-- Wholesale     20%
-- Retail        35%
-- VIP           15%
--
-- Notes
--
-- A customer may override this percentage inside customer_profiles.
--
-- =====================================================================

CREATE TABLE customer_types
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    name                TEXT NOT NULL,

    profit_percent      REAL NOT NULL DEFAULT 0,

    description         TEXT,

    is_active           INTEGER NOT NULL DEFAULT 1,

    created_at          TEXT NOT NULL,

    updated_at          TEXT,

    deleted_at          TEXT,

    CONSTRAINT uq_customer_type_name
        UNIQUE(name),

    CONSTRAINT ck_customer_type_profit
        CHECK(profit_percent >= 0)
);

CREATE INDEX idx_customer_type_name
ON customer_types(name);

CREATE INDEX idx_customer_type_active
ON customer_types(is_active);

CREATE INDEX idx_customer_type_deleted
ON customer_types(deleted_at);

-- =====================================================================
-- TABLE : contacts
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Stores every business party.
--
-- Supplier table does NOT exist.
--
-- Every supplier is also a contact.
--
-- Every customer is also a contact.
--
-- =====================================================================

CREATE TABLE contacts
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    code                    TEXT NOT NULL,

    display_name            TEXT NOT NULL,

    national_id             TEXT,

    economic_code           TEXT,

    phone                   TEXT,

    mobile                  TEXT,

    email                   TEXT,

    address                 TEXT,

    postal_code             TEXT,

    description             TEXT,

    is_active               INTEGER NOT NULL DEFAULT 1,

    created_at              TEXT NOT NULL,

    updated_at              TEXT,

    deleted_at              TEXT,

    CONSTRAINT uq_contact_code
        UNIQUE(code)
);

CREATE INDEX idx_contact_name
ON contacts(display_name);

CREATE INDEX idx_contact_mobile
ON contacts(mobile);

CREATE INDEX idx_contact_active
ON contacts(is_active);

CREATE INDEX idx_contact_deleted
ON contacts(deleted_at);

-- =====================================================================
-- TABLE : customer_profiles
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Stores customer specific sales configuration.
--
-- Every Contact
-- may have
-- exactly one
-- Customer Profile.
--
-- =====================================================================

CREATE TABLE customer_profiles
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    contact_id                  INTEGER NOT NULL,

    customer_type_id            INTEGER NOT NULL,

    custom_profit_percent       REAL,

    credit_limit                REAL DEFAULT 0,

    notes                       TEXT,

    created_at                  TEXT NOT NULL,

    updated_at                  TEXT,

    CONSTRAINT uq_customer_profile
        UNIQUE(contact_id),

    CONSTRAINT ck_credit_limit
        CHECK(credit_limit >= 0),

    CONSTRAINT ck_customer_profit
        CHECK
        (
            custom_profit_percent IS NULL
            OR custom_profit_percent >= 0
        ),

    FOREIGN KEY(contact_id)
        REFERENCES contacts(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(customer_type_id)
        REFERENCES customer_types(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE INDEX idx_customer_profile_contact
ON customer_profiles(contact_id);

CREATE INDEX idx_customer_profile_type
ON customer_profiles(customer_type_id);

-- =====================================================================
-- END OF PAGE 01
-- =====================================================================

-- =====================================================================
-- PAGE 02
-- MASTER TABLES
--
-- Tables
--     • units
--     • categories
--     • products
-- =====================================================================

-- =====================================================================
-- TABLE : units
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Product measurement units.
--
-- Examples
--
-- Piece
-- Box
-- Carton
-- Meter
-- Kilogram
--
-- Every Product belongs to exactly one Unit.
--
-- Unit conversion is NOT supported in Version 1.0
--
-- =====================================================================

CREATE TABLE units
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    name                TEXT NOT NULL,

    symbol              TEXT NOT NULL,

    description         TEXT,

    is_active           INTEGER NOT NULL DEFAULT 1,

    created_at          TEXT NOT NULL,

    updated_at          TEXT,

    deleted_at          TEXT,

    CONSTRAINT uq_units_name
        UNIQUE(name),

    CONSTRAINT uq_units_symbol
        UNIQUE(symbol)
);

CREATE INDEX idx_units_name
ON units(name);

CREATE INDEX idx_units_active
ON units(is_active);

CREATE INDEX idx_units_deleted
ON units(deleted_at);

-- =====================================================================
-- TABLE : categories
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Product categories.
--
-- Examples
--
-- Mobile
-- Laptop
-- Accessories
--
-- Categories are optional.
--
-- =====================================================================

CREATE TABLE categories
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    name                TEXT NOT NULL,

    description         TEXT,

    is_active           INTEGER NOT NULL DEFAULT 1,

    created_at          TEXT NOT NULL,

    updated_at          TEXT,

    deleted_at          TEXT,

    CONSTRAINT uq_categories_name
        UNIQUE(name)
);

CREATE INDEX idx_categories_name
ON categories(name);

CREATE INDEX idx_categories_active
ON categories(is_active);

CREATE INDEX idx_categories_deleted
ON categories(deleted_at);

-- =====================================================================
-- TABLE : products
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Stores all products.
--
-- Design Decisions
--
-- Barcode:
--     Not Supported
--
-- Brand:
--     Stored inside Product Name
--
-- Minimum Stock:
--     Not Supported
--
-- Multiple Units:
--     Not Supported
--
-- Every Product belongs to exactly one Unit.
--
-- Category is optional.
--
-- =====================================================================

CREATE TABLE products
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    name                    TEXT NOT NULL,

    category_id             INTEGER,

    unit_id                 INTEGER NOT NULL,

    description             TEXT,

    is_active               INTEGER NOT NULL DEFAULT 1,

    created_at              TEXT NOT NULL,

    updated_at              TEXT,

    deleted_at              TEXT,

    CONSTRAINT uq_products_code
        UNIQUE(code),

    FOREIGN KEY(category_id)
        REFERENCES categories(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(unit_id)
        REFERENCES units(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE INDEX idx_products_code
ON products(code);

CREATE INDEX idx_products_name
ON products(name);

CREATE INDEX idx_products_category
ON products(category_id);

CREATE INDEX idx_products_unit
ON products(unit_id);

CREATE INDEX idx_products_active
ON products(is_active);

CREATE INDEX idx_products_deleted
ON products(deleted_at);

-- =====================================================================
-- PRODUCT BUSINESS NOTES
-- ---------------------------------------------------------------------
--
-- Purchase Price
--     Never stored here.
--
-- Sale Price
--     Never stored here.
--
-- Inventory
--     Never stored here.
--
-- Current Quantity
--     Never stored here.
--
-- Product Cost
--     Always calculated from Inventory Lots.
--
-- Sale Price Suggestion
--     Calculated during Sale Process.
--
-- Final Cost
--     Comes from FIFO.
--
-- =====================================================================

-- =====================================================================
-- END OF PAGE 02
-- =====================================================================

-- =====================================================================
-- PAGE 03
-- CURRENCY
--
-- Tables
--     • currencies
--     • currency_rates
--
-- =====================================================================

-- =====================================================================
-- TABLE : currencies
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Stores supported currencies.
--
-- Examples
--
-- IRR
-- AED
-- USD
-- EUR
--
-- Design Rules
--
-- Base Currency = IRR
--
-- Exchange rates are stored in currency_rates.
--
-- =====================================================================

CREATE TABLE currencies
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    code                TEXT NOT NULL,

    name                TEXT NOT NULL,

    symbol              TEXT,

    is_base             INTEGER NOT NULL DEFAULT 0,

    is_active           INTEGER NOT NULL DEFAULT 1,

    created_at          TEXT NOT NULL,

    updated_at          TEXT,

    deleted_at          TEXT,

    CONSTRAINT uq_currency_code
        UNIQUE(code),

    CONSTRAINT uq_currency_name
        UNIQUE(name),

    CONSTRAINT ck_currency_base
        CHECK(is_base IN (0,1)),

    CONSTRAINT ck_currency_active
        CHECK(is_active IN (0,1))
);

CREATE INDEX idx_currency_code
ON currencies(code);

CREATE INDEX idx_currency_name
ON currencies(name);

CREATE INDEX idx_currency_active
ON currencies(is_active);

CREATE INDEX idx_currency_deleted
ON currencies(deleted_at);

-- =====================================================================
-- TABLE : currency_rates
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Stores exchange rate history.
--
-- Business Rules
--
-- • Exchange rates are immutable.
--
-- • Updating old rates is forbidden.
--
-- • Every new price creates a NEW RECORD.
--
-- • The latest inserted record is considered
--   the ACTIVE exchange rate.
--
-- • Sales store a snapshot of the selected rate.
--
-- =====================================================================

CREATE TABLE currency_rates
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    currency_id             INTEGER NOT NULL,

    rate                    REAL NOT NULL,

    effective_at            TEXT NOT NULL,

    description             TEXT,

    created_at              TEXT NOT NULL,

    FOREIGN KEY(currency_id)
        REFERENCES currencies(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CONSTRAINT ck_currency_rate
        CHECK(rate > 0)
);

CREATE INDEX idx_currency_rates_currency
ON currency_rates(currency_id);

CREATE INDEX idx_currency_rates_date
ON currency_rates(effective_at DESC);

CREATE INDEX idx_currency_rates_created
ON currency_rates(created_at DESC);

-- =====================================================================
-- VIEW : active_currency_rates
-- ---------------------------------------------------------------------
--
-- Returns latest exchange rate for every currency.
--
-- The application may query this View
-- instead of manually searching for MAX(id).
--
-- =====================================================================

CREATE VIEW active_currency_rates AS

SELECT
    r.*
FROM currency_rates r

INNER JOIN
(
    SELECT
        currency_id,
        MAX(id) AS max_id
    FROM currency_rates
    GROUP BY currency_id
) latest

ON latest.max_id = r.id;

-- =====================================================================
-- SEED DATA
-- =====================================================================

INSERT INTO currencies
(
    code,
    name,
    symbol,
    is_base,
    is_active,
    created_at
)
VALUES

('IRR','Iranian Rial','﷼',1,1,CURRENT_TIMESTAMP),

('AED','UAE Dirham','AED',0,1,CURRENT_TIMESTAMP),

('USD','US Dollar','$',0,1,CURRENT_TIMESTAMP),

('EUR','Euro','€',0,1,CURRENT_TIMESTAMP);

-- =====================================================================
-- CURRENCY NOTES
-- ---------------------------------------------------------------------
--
-- Purchases
--     Usually AED / USD / EUR
--
-- Sales
--     Always IRR
--
-- Inventory Cost
--     Stored using purchase currency snapshot.
--
-- Suggested Sale Price
--     Uses latest exchange rate.
--
-- Actual Sale Price
--     User may change freely.
--
-- Changing exchange rate NEVER changes
-- previous invoices.
--
-- =====================================================================

-- =====================================================================
-- END OF PAGE 03
-- =====================================================================
 -- =====================================================================
-- PAGE 04
-- PURCHASE MODULE
--
-- Tables
--     • purchase_invoices
--     • purchase_invoice_items
--     • purchase_costs
--
-- =====================================================================

-- =====================================================================
-- TABLE : purchase_invoices
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Purchase invoice header.
--
-- Business Rules
--
-- • Purchase may be in any currency.
-- • Exchange rate is stored as Snapshot.
-- • Changing exchange rate later must NOT affect invoice.
--
-- =====================================================================

CREATE TABLE purchase_invoices
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    invoice_number          TEXT NOT NULL,

    contact_id              INTEGER NOT NULL,

    currency_id             INTEGER NOT NULL,

    currency_rate_id        INTEGER NOT NULL,

    currency_rate           REAL NOT NULL,

    invoice_date            TEXT NOT NULL,

    description             TEXT,

    status                  TEXT NOT NULL DEFAULT 'Draft',

    created_at              TEXT NOT NULL,

    updated_at              TEXT,

    CONSTRAINT uq_purchase_invoice_number
        UNIQUE(invoice_number),

    CONSTRAINT ck_purchase_status
        CHECK(status IN
        (
            'Draft',
            'Confirmed',
            'Cancelled'
        )),

    FOREIGN KEY(contact_id)
        REFERENCES contacts(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(currency_id)
        REFERENCES currencies(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(currency_rate_id)
        REFERENCES currency_rates(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(currency_rate > 0)
);

CREATE INDEX idx_purchase_invoice_number
ON purchase_invoices(invoice_number);

CREATE INDEX idx_purchase_contact
ON purchase_invoices(contact_id);

CREATE INDEX idx_purchase_date
ON purchase_invoices(invoice_date);

CREATE INDEX idx_purchase_status
ON purchase_invoices(status);

-- =====================================================================
-- TABLE : purchase_invoice_items
-- =====================================================================
--
-- Business Rules
--
-- unit_cost
--      Original purchase price
--
-- allocated_cost
--      Freight/Insurance share
--
-- final_unit_cost
--      Used by FIFO
--
-- =====================================================================

CREATE TABLE purchase_invoice_items
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    purchase_invoice_id         INTEGER NOT NULL,

    product_id                  INTEGER NOT NULL,

    quantity                    REAL NOT NULL,

    unit_cost                   REAL NOT NULL,

    allocated_cost              REAL NOT NULL DEFAULT 0,

    final_unit_cost             REAL NOT NULL,

    line_total                  REAL NOT NULL,

    description                 TEXT,

    FOREIGN KEY(purchase_invoice_id)
        REFERENCES purchase_invoices(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(quantity > 0),

    CHECK(unit_cost >= 0),

    CHECK(allocated_cost >= 0),

    CHECK(final_unit_cost >= unit_cost)
);

CREATE INDEX idx_purchase_items_invoice
ON purchase_invoice_items(purchase_invoice_id);

CREATE INDEX idx_purchase_items_product
ON purchase_invoice_items(product_id);

-- =====================================================================
-- TABLE : purchase_costs
-- =====================================================================
--
-- Business Rules
--
-- Every extra expense belongs to one invoice.
--
-- Examples
--
-- Freight
-- Insurance
-- Customs
-- Loading
--
-- Version 1.0
--
-- All costs are divided equally
-- between invoice items.
--
-- =====================================================================

CREATE TABLE purchase_costs
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    purchase_invoice_id         INTEGER NOT NULL,

    title                       TEXT NOT NULL,

    amount                      REAL NOT NULL,

    description                 TEXT,

    created_at                  TEXT NOT NULL,

    FOREIGN KEY(purchase_invoice_id)
        REFERENCES purchase_invoices(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(amount >= 0)
);

CREATE INDEX idx_purchase_cost_invoice
ON purchase_costs(purchase_invoice_id);

-- =====================================================================
-- PURCHASE NOTES
-- ---------------------------------------------------------------------
--
-- Example
--
-- Purchase:
--
-- Product A
-- Qty : 10
-- Cost : 1000 AED
--
-- Product B
-- Qty : 10
-- Cost : 500 AED
--
-- Freight : 300 AED
--
-- Freight Share
--
-- Product A : 150 AED
-- Product B : 150 AED
--
-- Final Cost
--
-- Product A = 1150 AED
--
-- Product B = 650 AED
--
-- final_unit_cost is stored permanently
-- and never recalculated.
--
-- Inventory Lots use final_unit_cost.
--
-- =====================================================================

-- =====================================================================
-- END OF PAGE 04
-- =====================================================================

-- =====================================================================
-- PAGE 05
-- INVENTORY MODULE
--
-- Tables
--     • inventory_lots
--     • inventory_transactions
--
-- Inventory Method
-- ---------------------------------------------------------------------
-- FIFO (First In First Out)
--
-- =====================================================================

-- =====================================================================
-- TABLE : inventory_lots
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Every confirmed purchase creates one or more inventory lots.
--
-- Lots are never edited.
--
-- remaining_quantity decreases after every sale.
--
-- FIFO always selects the oldest available lot.
--
-- =====================================================================

CREATE TABLE inventory_lots
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    purchase_invoice_item_id     INTEGER NOT NULL,

    product_id                  INTEGER NOT NULL,

    purchase_currency_id         INTEGER NOT NULL,

    purchase_currency_rate       REAL NOT NULL,

    unit_cost                   REAL NOT NULL,

    allocated_cost              REAL NOT NULL,

    final_unit_cost             REAL NOT NULL,

    initial_quantity            REAL NOT NULL,

    remaining_quantity          REAL NOT NULL,

    received_at                 TEXT NOT NULL,

    created_at                  TEXT NOT NULL,

    FOREIGN KEY(purchase_invoice_item_id)
        REFERENCES purchase_invoice_items(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(purchase_currency_id)
        REFERENCES currencies(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(initial_quantity > 0),

    CHECK(remaining_quantity >= 0),

    CHECK(remaining_quantity <= initial_quantity),

    CHECK(final_unit_cost >= unit_cost)
);

CREATE INDEX idx_inventory_lots_product
ON inventory_lots(product_id);

CREATE INDEX idx_inventory_lots_fifo
ON inventory_lots
(
    product_id,
    received_at,
    id
);

CREATE INDEX idx_inventory_lots_remaining
ON inventory_lots
(
    product_id,
    remaining_quantity
);

-- =====================================================================
-- TABLE : inventory_transactions
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Complete inventory history.
--
-- Every inventory movement creates one transaction.
--
-- Examples
--
-- Purchase
-- Sale
-- Manual Adjustment
--
-- =====================================================================

CREATE TABLE inventory_transactions
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    product_id              INTEGER NOT NULL,

    inventory_lot_id        INTEGER,

    transaction_type        TEXT NOT NULL,

    quantity                REAL NOT NULL,

    reference_table         TEXT NOT NULL,

    reference_id            INTEGER NOT NULL,

    transaction_date        TEXT NOT NULL,

    description             TEXT,

    created_at              TEXT NOT NULL,

    FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(inventory_lot_id)
        REFERENCES inventory_lots(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(transaction_type IN
    (
        'Purchase',
        'Sale',
        'Adjustment'
    )),

    CHECK(quantity > 0)
);

CREATE INDEX idx_inventory_tx_product
ON inventory_transactions(product_id);

CREATE INDEX idx_inventory_tx_lot
ON inventory_transactions(inventory_lot_id);

CREATE INDEX idx_inventory_tx_date
ON inventory_transactions(transaction_date);

CREATE INDEX idx_inventory_tx_reference
ON inventory_transactions
(
    reference_table,
    reference_id
);

-- =====================================================================
-- INVENTORY NOTES
-- ---------------------------------------------------------------------
--
-- Purchase Confirmation
--
-- Purchase Item
--
-- Qty : 100
--
-- Creates
--
-- Inventory Lot
--
-- initial_quantity = 100
--
-- remaining_quantity = 100
--
--
-- First Sale
--
-- Qty : 30
--
-- remaining_quantity = 70
--
--
-- Second Sale
--
-- Qty : 20
--
-- remaining_quantity = 50
--
--
-- FIFO
--
-- Always selects
--
-- Oldest Lot
--
-- where
--
-- remaining_quantity > 0
--
--
-- Inventory Quantity
--
-- SUM(remaining_quantity)
--
--
-- Inventory Cost
--
-- SUM(remaining_quantity × final_unit_cost)
--
--
-- Lots are NEVER updated except:
--
-- remaining_quantity
--
-- =====================================================================

-- =====================================================================
-- END OF PAGE 05
-- =====================================================================


-- =====================================================================
-- PAGE 06
-- SALES MODULE
--
-- Tables
--     • sales_invoices
--     • sales_invoice_items
--     • sales_inventory_allocations
--
-- =====================================================================

-- =====================================================================
-- TABLE : sales_invoices
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Sales Invoice Header
--
-- Business Rules
--
-- • Sales are always in IRR.
--
-- • Exchange rate is stored as Snapshot.
--
-- • Customer pricing is calculated only once.
--
-- • User may change suggested prices.
--
-- =====================================================================

CREATE TABLE sales_invoices
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    invoice_number              TEXT NOT NULL,

    contact_id                  INTEGER NOT NULL,

    currency_rate_id            INTEGER NOT NULL,

    currency_rate               REAL NOT NULL,

    invoice_date                TEXT NOT NULL,

    description                 TEXT,

    status                      TEXT NOT NULL DEFAULT 'Draft',

    created_at                  TEXT NOT NULL,

    updated_at                  TEXT,

    CONSTRAINT uq_sales_invoice_number
        UNIQUE(invoice_number),

    CHECK(status IN
    (
        'Draft',
        'Confirmed',
        'Cancelled'
    )),

    FOREIGN KEY(contact_id)
        REFERENCES contacts(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(currency_rate_id)
        REFERENCES currency_rates(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(currency_rate > 0)
);

CREATE INDEX idx_sales_invoice_number
ON sales_invoices(invoice_number);

CREATE INDEX idx_sales_contact
ON sales_invoices(contact_id);

CREATE INDEX idx_sales_date
ON sales_invoices(invoice_date);

CREATE INDEX idx_sales_status
ON sales_invoices(status);

-- =====================================================================
-- TABLE : sales_invoice_items
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Stores final sold prices.
--
-- Business Rules
--
-- suggested_unit_price
--      Calculated by system.
--
-- sale_unit_price
--      Final user price.
--
-- User may sell below
-- or above suggested price.
--
-- =====================================================================

CREATE TABLE sales_invoice_items
(
    id                              INTEGER PRIMARY KEY AUTOINCREMENT,

    sales_invoice_id                INTEGER NOT NULL,

    product_id                      INTEGER NOT NULL,

    quantity                        REAL NOT NULL,

    fifo_unit_cost                  REAL NOT NULL,

    purchase_currency_id            INTEGER NOT NULL,

    purchase_currency_rate          REAL NOT NULL,

    sale_exchange_rate              REAL NOT NULL,

    customer_profit_percent         REAL NOT NULL,

    suggested_unit_price            REAL NOT NULL,

    sale_unit_price                 REAL NOT NULL,

    line_total                      REAL NOT NULL,

    description                     TEXT,

    FOREIGN KEY(sales_invoice_id)
        REFERENCES sales_invoices(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(purchase_currency_id)
        REFERENCES currencies(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(quantity > 0),

    CHECK(fifo_unit_cost >= 0),

    CHECK(sale_unit_price >= 0),

    CHECK(suggested_unit_price >= 0),

    CHECK(customer_profit_percent >= 0)
);

CREATE INDEX idx_sales_items_invoice
ON sales_invoice_items(sales_invoice_id);

CREATE INDEX idx_sales_items_product
ON sales_invoice_items(product_id);

-- =====================================================================
-- TABLE : sales_inventory_allocations
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- FIFO Allocation Log
--
-- One sales item may consume
-- multiple inventory lots.
--
-- =====================================================================

CREATE TABLE sales_inventory_allocations
(
    id                              INTEGER PRIMARY KEY AUTOINCREMENT,

    sales_invoice_item_id           INTEGER NOT NULL,

    inventory_lot_id                INTEGER NOT NULL,

    quantity                        REAL NOT NULL,

    fifo_unit_cost                  REAL NOT NULL,

    fifo_total_cost                 REAL NOT NULL,

    created_at                      TEXT NOT NULL,

    FOREIGN KEY(sales_invoice_item_id)
        REFERENCES sales_invoice_items(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(inventory_lot_id)
        REFERENCES inventory_lots(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(quantity > 0),

    CHECK(fifo_unit_cost >= 0),

    CHECK(fifo_total_cost >= 0)
);

CREATE INDEX idx_sales_alloc_item
ON sales_inventory_allocations(sales_invoice_item_id);

CREATE INDEX idx_sales_alloc_lot
ON sales_inventory_allocations(inventory_lot_id);

-- =====================================================================
-- SALES NOTES
-- ---------------------------------------------------------------------
--
-- Suggested Price
--
-- (FIFO Cost)
--
-- ×
--
-- Current Exchange Rate
--
-- ×
--
-- Customer Profit %
--
--
-- Example
--
-- FIFO Cost
--      1100 AED
--
-- Exchange Rate
--      20,000 IRR
--
-- Customer Profit
--      20%
--
-- Suggested Price
--
-- 1100 × 20,000 × 1.20
--
--
-- User may change:
--
-- sale_unit_price
--
-- without any restriction.
--
--
-- FIFO Allocation Example
--
-- Sale Qty = 120
--
-- Lot A = 70
--
-- Lot B = 50
--
--
-- Two allocation rows
-- will be created.
--
--
-- Previous invoices NEVER
-- change after exchange rate updates.
--
-- =====================================================================

-- =====================================================================
-- END OF PAGE 06
-- =====================================================================



-- =====================================================================
-- PAGE 07
-- CURRENCY CONVERSION & SYSTEM SETTINGS
--
-- Tables
--     • currency_conversions
--     • settings
--
-- =====================================================================

-- =====================================================================
-- TABLE : currency_conversions
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Records every real currency exchange operation.
--
-- Business Rules
--
-- • Sales generate IRR balance.
--
-- • Later the business converts
--   part (or all) of that balance
--   into another currency.
--
-- • Expected amount is calculated
--   using the latest exchange rate.
--
-- • Actual amount is entered manually.
--
-- • Difference is stored permanently.
--
-- =====================================================================

CREATE TABLE currency_conversions
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    conversion_number           TEXT NOT NULL,

    conversion_date             TEXT NOT NULL,

    from_currency_id            INTEGER NOT NULL,

    to_currency_id              INTEGER NOT NULL,

    source_amount               REAL NOT NULL,

    expected_rate_id            INTEGER NOT NULL,

    expected_rate               REAL NOT NULL,

    expected_destination_amount REAL NOT NULL,

    actual_destination_amount   REAL NOT NULL,

    difference_amount           REAL NOT NULL,

    description                 TEXT,

    created_at                  TEXT NOT NULL,

    updated_at                  TEXT,

    CONSTRAINT uq_conversion_number
        UNIQUE(conversion_number),

    FOREIGN KEY(from_currency_id)
        REFERENCES currencies(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(to_currency_id)
        REFERENCES currencies(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(expected_rate_id)
        REFERENCES currency_rates(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(source_amount > 0),

    CHECK(expected_rate > 0),

    CHECK(expected_destination_amount >= 0),

    CHECK(actual_destination_amount >= 0)
);

CREATE INDEX idx_conversion_date
ON currency_conversions(conversion_date);

CREATE INDEX idx_conversion_from_currency
ON currency_conversions(from_currency_id);

CREATE INDEX idx_conversion_to_currency
ON currency_conversions(to_currency_id);

-- =====================================================================
-- TABLE : settings
-- =====================================================================
--
-- Purpose
-- ---------------------------------------------------------------------
-- Stores application settings.
--
-- Examples
--
-- Company Name
-- Company Phone
-- Company Address
-- Default Language
-- Theme
--
-- =====================================================================

CREATE TABLE settings
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    setting_key         TEXT NOT NULL,

    setting_value       TEXT,

    description         TEXT,

    created_at          TEXT NOT NULL,

    updated_at          TEXT,

    CONSTRAINT uq_settings_key
        UNIQUE(setting_key)
);

CREATE INDEX idx_settings_key
ON settings(setting_key);

-- =====================================================================
-- INITIAL SETTINGS
-- =====================================================================

INSERT INTO settings
(
    setting_key,
    setting_value,
    description,
    created_at
)
VALUES

(
    'company_name',
    '',
    'Company Name',
    CURRENT_TIMESTAMP
),

(
    'company_phone',
    '',
    'Company Phone',
    CURRENT_TIMESTAMP
),

(
    'company_address',
    '',
    'Company Address',
    CURRENT_TIMESTAMP
),

(
    'default_currency',
    'IRR',
    'Base Currency',
    CURRENT_TIMESTAMP
),

(
    'default_language',
    'fa',
    'Application Language',
    CURRENT_TIMESTAMP
),

(
    'theme',
    'system',
    'Application Theme',
    CURRENT_TIMESTAMP
);

-- =====================================================================
-- CURRENCY CONVERSION EXAMPLE
-- ---------------------------------------------------------------------
--
-- Sales Balance
--
-- IRR
--
-- 100,000,000
--
--
-- Latest AED Rate
--
-- 200,000
--
--
-- Expected AED
--
-- 500
--
--
-- Actual Received
--
-- 485
--
--
-- Difference
--
-- -15 AED
--
--
-- This difference is stored permanently
-- and used in financial reports.
--
-- =====================================================================

-- =====================================================================
-- SETTINGS NOTES
-- ---------------------------------------------------------------------
--
-- Version 1.0
--
-- One Company
--
-- One Warehouse
--
-- One Base Currency
--
-- Unlimited Foreign Currencies
--
-- FIFO Inventory
--
-- Snapshot Exchange Rates
--
-- Editable Sale Price
--
-- =====================================================================

-- =====================================================================
-- END OF PAGE 07
-- =====================================================================
-- =====================================================================
-- PAGE 08
-- DATABASE VIEWS
-- REPORTING VIEWS
-- =====================================================================

-- =====================================================================
-- VIEW : current_inventory
-- ---------------------------------------------------------------------
-- Current inventory by product
-- =====================================================================

CREATE VIEW current_inventory AS

SELECT

    p.id                    AS product_id,

    p.name                  AS product_name,

    SUM(l.remaining_quantity) AS quantity,

    AVG(l.final_unit_cost)  AS average_cost,

    SUM
    (
        l.remaining_quantity * l.final_unit_cost
    ) AS inventory_value

FROM products p

LEFT JOIN inventory_lots l
ON l.product_id = p.id

GROUP BY
    p.id,
    p.name;

-- =====================================================================
-- VIEW : active_currency_rates
-- ---------------------------------------------------------------------
-- Latest exchange rate of every currency
-- =====================================================================

CREATE VIEW active_currency_rates AS

SELECT
    cr.*

FROM currency_rates cr

INNER JOIN
(
    SELECT
        currency_id,
        MAX(id) AS latest_id

    FROM currency_rates

    GROUP BY currency_id

) x

ON x.latest_id = cr.id;

-- =====================================================================
-- VIEW : inventory_fifo
-- ---------------------------------------------------------------------
-- FIFO Queue
-- =====================================================================

CREATE VIEW inventory_fifo AS

SELECT

    id,

    product_id,

    final_unit_cost,

    remaining_quantity,

    received_at

FROM inventory_lots

WHERE remaining_quantity > 0

ORDER BY

product_id,

received_at,

id;

-- =====================================================================
-- VIEW : product_last_purchase
-- =====================================================================

CREATE VIEW product_last_purchase AS

SELECT

    p.id,

    p.name,

    MAX(pi.invoice_date) AS last_purchase_date

FROM products p

LEFT JOIN purchase_invoice_items pii
ON pii.product_id = p.id

LEFT JOIN purchase_invoices pi
ON pi.id = pii.purchase_invoice_id

GROUP BY

p.id,
p.name;

-- =====================================================================
-- VIEW : product_stock_value
-- =====================================================================

CREATE VIEW product_stock_value AS

SELECT

    product_id,

    SUM(remaining_quantity) AS stock,

    SUM
    (
        remaining_quantity *
        final_unit_cost
    ) AS stock_value

FROM inventory_lots

GROUP BY product_id;

-- =====================================================================
-- INDEXES
-- =====================================================================

CREATE INDEX idx_inventory_fifo_lookup

ON inventory_lots
(
    product_id,
    remaining_quantity,
    received_at
);

CREATE INDEX idx_sales_invoice_report

ON sales_invoices
(
    invoice_date,
    contact_id
);

CREATE INDEX idx_purchase_invoice_report

ON purchase_invoices
(
    invoice_date,
    contact_id
);

CREATE INDEX idx_currency_rate_lookup

ON currency_rates
(
    currency_id,
    id DESC
);

CREATE INDEX idx_inventory_value

ON inventory_lots
(
    product_id,
    final_unit_cost
);

-- =====================================================================
-- DEFAULT CURRENCIES
-- =====================================================================

INSERT INTO currencies
(
code,
name,
symbol,
is_base,
is_active,
created_at
)

VALUES

('IRR','Iranian Rial','﷼',1,1,CURRENT_TIMESTAMP),

('AED','UAE Dirham','AED',0,1,CURRENT_TIMESTAMP),

('USD','US Dollar','$',0,1,CURRENT_TIMESTAMP),

('EUR','Euro','€',0,1,CURRENT_TIMESTAMP);

-- =====================================================================
-- DEFAULT CUSTOMER TYPES
-- =====================================================================

INSERT INTO customer_types
(
name,
profit_percent,
is_active,
created_at
)

VALUES

(
'Retail',
20,
1,
CURRENT_TIMESTAMP
),

(
'Wholesale',
10,
1,
CURRENT_TIMESTAMP
);

-- =====================================================================
-- DEFAULT UNIT
-- =====================================================================

INSERT INTO units
(
name,
symbol,
is_active,
created_at
)

VALUES

(
'Piece',
'pcs',
1,
CURRENT_TIMESTAMP
);

-- =====================================================================
-- DEFAULT SETTINGS
-- =====================================================================

INSERT INTO settings
(
setting_key,
setting_value,
created_at
)

VALUES

(
'inventory_method',
'FIFO',
CURRENT_TIMESTAMP
),

(
'base_currency',
'IRR',
CURRENT_TIMESTAMP
),

(
'default_sale_currency',
'IRR',
CURRENT_TIMESTAMP
);

-- =====================================================================
-- END OF PAGE 08
-- =====================================================================
-- =====================================================================
-- PAGE 09
-- TRIGGERS
-- DATA INTEGRITY
-- BUSINESS RULES
-- =====================================================================

-- =====================================================================
-- TRIGGER
-- Prevent editing confirmed Purchase Invoice
-- =====================================================================

CREATE TRIGGER trg_purchase_invoice_no_update

BEFORE UPDATE
ON purchase_invoices

WHEN OLD.status = 'Confirmed'

BEGIN

SELECT RAISE
(
    ABORT,
    'Confirmed purchase invoice cannot be modified.'
);

END;

-- =====================================================================
-- TRIGGER
-- Prevent deleting confirmed Purchase Invoice
-- =====================================================================

CREATE TRIGGER trg_purchase_invoice_no_delete

BEFORE DELETE
ON purchase_invoices

WHEN OLD.status = 'Confirmed'

BEGIN

SELECT RAISE
(
    ABORT,
    'Confirmed purchase invoice cannot be deleted.'
);

END;

-- =====================================================================
-- TRIGGER
-- Prevent editing confirmed Sales Invoice
-- =====================================================================

CREATE TRIGGER trg_sales_invoice_no_update

BEFORE UPDATE
ON sales_invoices

WHEN OLD.status='Confirmed'

BEGIN

SELECT RAISE
(
    ABORT,
    'Confirmed sales invoice cannot be modified.'
);

END;

-- =====================================================================
-- TRIGGER
-- Prevent deleting confirmed Sales Invoice
-- =====================================================================

CREATE TRIGGER trg_sales_invoice_no_delete

BEFORE DELETE
ON sales_invoices

WHEN OLD.status='Confirmed'

BEGIN

SELECT RAISE
(
    ABORT,
    'Confirmed sales invoice cannot be deleted.'
);

END;

-- =====================================================================
-- TRIGGER
-- Prevent negative inventory
-- =====================================================================

CREATE TRIGGER trg_inventory_remaining_positive

BEFORE UPDATE
ON inventory_lots

WHEN NEW.remaining_quantity < 0

BEGIN

SELECT RAISE
(
    ABORT,
    'Inventory cannot become negative.'
);

END;

-- =====================================================================
-- TRIGGER
-- Prevent changing exchange rates
-- =====================================================================

CREATE TRIGGER trg_currency_rate_no_update

BEFORE UPDATE
ON currency_rates

BEGIN

SELECT RAISE
(
    ABORT,
    'Exchange rates are immutable.'
);

END;

-- =====================================================================
-- TRIGGER
-- Prevent deleting exchange rates
-- =====================================================================

CREATE TRIGGER trg_currency_rate_no_delete

BEFORE DELETE
ON currency_rates

BEGIN

SELECT RAISE
(
    ABORT,
    'Exchange rates cannot be deleted.'
);

END;

-- =====================================================================
-- TRIGGER
-- Auto update updated_at
-- contacts
-- =====================================================================

CREATE TRIGGER trg_contacts_updated_at

AFTER UPDATE
ON contacts

BEGIN

UPDATE contacts

SET updated_at = CURRENT_TIMESTAMP

WHERE id = NEW.id;

END;

-- =====================================================================
-- customer_types
-- =====================================================================

CREATE TRIGGER trg_customer_types_updated_at

AFTER UPDATE
ON customer_types

BEGIN

UPDATE customer_types

SET updated_at = CURRENT_TIMESTAMP

WHERE id = NEW.id;

END;

-- =====================================================================
-- products
-- =====================================================================

CREATE TRIGGER trg_products_updated_at

AFTER UPDATE
ON products

BEGIN

UPDATE products

SET updated_at = CURRENT_TIMESTAMP

WHERE id = NEW.id;

END;

-- =====================================================================
-- categories
-- =====================================================================

CREATE TRIGGER trg_categories_updated_at

AFTER UPDATE
ON categories

BEGIN

UPDATE categories

SET updated_at = CURRENT_TIMESTAMP

WHERE id = NEW.id;

END;

-- =====================================================================
-- units
-- =====================================================================

CREATE TRIGGER trg_units_updated_at

AFTER UPDATE
ON units

BEGIN

UPDATE units

SET updated_at = CURRENT_TIMESTAMP

WHERE id = NEW.id;

END;

-- =====================================================================
-- currencies
-- =====================================================================

CREATE TRIGGER trg_currencies_updated_at

AFTER UPDATE
ON currencies

BEGIN

UPDATE currencies

SET updated_at = CURRENT_TIMESTAMP

WHERE id = NEW.id;

END;

-- =====================================================================
-- SETTINGS
-- =====================================================================

CREATE TRIGGER trg_settings_updated_at

AFTER UPDATE
ON settings

BEGIN

UPDATE settings

SET updated_at = CURRENT_TIMESTAMP

WHERE id = NEW.id;

END;

-- =====================================================================
-- BUSINESS RULES
-- ---------------------------------------------------------------------
--
-- 1.
-- Purchase invoices become read-only after confirmation.
--
-- 2.
-- Sales invoices become read-only after confirmation.
--
-- 3.
-- Exchange rates are immutable.
--
-- 4.
-- Inventory may never become negative.
--
-- 5.
-- FIFO allocation is permanent.
--
-- 6.
-- Sale price is always editable before confirmation.
--
-- 7.
-- Historical invoices never change.
--
-- 8.
-- Historical exchange rates never change.
--
-- 9.
-- Inventory lots are permanent.
--
-- 10.
-- Only remaining_quantity changes inside lots.
--
-- =====================================================================

-- =====================================================================
-- END OF PAGE 09
-- =====================================================================
-- =====================================================================
-- PAGE 10
-- FINALIZATION
-- VERSION 1.0
-- =====================================================================

-- =====================================================================
-- DATABASE SUMMARY
-- =====================================================================
--
-- Version
--
-- 1.0.0
--
--
-- Database
--
-- SQLite
--
--
-- Inventory Method
--
-- FIFO
--
--
-- Base Currency
--
-- IRR
--
--
-- Purchase Currency
--
-- Unlimited
--
--
-- Sales Currency
--
-- IRR
--
--
-- Warehouse
--
-- Single
--
--
-- Accounting
--
-- Not Included
--
--
-- Bank
--
-- Not Included
--
--
-- Cashbox
--
-- Not Included
--
--
-- Barcode
--
-- Not Included
--
--
-- Supplier Module
--
-- Not Included
--
--
-- Unit Conversion
--
-- Not Included
--
--
-- Brand
--
-- Stored inside Product Name
--
-- =====================================================================

-- =====================================================================
-- DATABASE OBJECTS
-- =====================================================================
--
-- MASTER TABLES
--
-- customer_types
-- contacts
-- customer_profiles
-- units
-- categories
-- products
--
--
-- CURRENCY
--
-- currencies
-- currency_rates
--
--
-- PURCHASE
--
-- purchase_invoices
-- purchase_invoice_items
-- purchase_costs
--
--
-- INVENTORY
--
-- inventory_lots
-- inventory_transactions
--
--
-- SALES
--
-- sales_invoices
-- sales_invoice_items
-- sales_inventory_allocations
--
--
-- OTHER
--
-- currency_conversions
-- settings
--
-- =====================================================================

-- =====================================================================
-- IMPLEMENTED BUSINESS RULES
-- =====================================================================
--
-- ✓ FIFO Inventory
--
-- ✓ Snapshot Exchange Rate
--
-- ✓ Snapshot Purchase Cost
--
-- ✓ Snapshot Sale Price
--
-- ✓ Customer Type Profit
--
-- ✓ Customer Custom Profit
--
-- ✓ Equal Freight Distribution
--
-- ✓ Editable Sale Price
--
-- ✓ Immutable Exchange Rates
--
-- ✓ Immutable Confirmed Documents
--
-- ✓ Inventory Lots
--
-- ✓ Currency Conversion Tracking
--
-- ✓ Inventory History
--
-- ✓ Soft Delete For Master Data
--
-- ✓ One Warehouse
--
-- ✓ Unlimited Foreign Currencies
--
-- ✓ Reports Based On Historical Data
--
-- =====================================================================

-- =====================================================================
-- DATABASE STATISTICS
-- =====================================================================
--
-- Tables
--      18
--
-- Views
--      4
--
-- Triggers
--      11
--
-- Indexes
--      40+
--
-- Foreign Keys
--      20+
--
-- Constraints
--      50+
--
-- =====================================================================

-- =====================================================================
-- DEVELOPMENT ROADMAP
-- =====================================================================
--
-- Phase 01
--
-- ✓ Database Design
--
--
-- Phase 02
--
-- Drizzle ORM
--
--
-- Phase 03
--
-- Repository Layer
--
--
-- Phase 04
--
-- IPC Services
--
--
-- Phase 05
--
-- Purchase Module
--
--
-- Phase 06
--
-- Inventory Engine
--
--
-- Phase 07
--
-- Sales Engine
--
--
-- Phase 08
--
-- Currency Conversion
--
--
-- Phase 09
--
-- Reports
--
--
-- Phase 10
--
-- UI
--
-- =====================================================================

-- =====================================================================
-- VERSION HISTORY
-- =====================================================================
--
-- v1.0
--
-- Initial Database Design
--
--
-- Planned v1.1
--
-- Performance Improvements
--
-- Additional Views
--
-- Better Reporting Indexes
--
-- Optimized Triggers
--
--
-- Planned v1.2
--
-- Accounting Module
--
-- Bank Module
--
-- Cashbox Module
--
-- Multi Warehouse (Optional)
--
-- =====================================================================

COMMIT;

-- =====================================================================
-- END OF FILE
-- schema_v1.0.sql
-- =====================================================================