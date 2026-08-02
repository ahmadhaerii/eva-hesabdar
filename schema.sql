-- =====================================================
-- Accounting Software Database Schema
-- Database : SQLite
-- Version  : 1.0.0
-- =====================================================

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- =====================================================
-- TABLE : customer_types
-- =====================================================

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

    CONSTRAINT uq_customer_types_name
        UNIQUE(name),

    CONSTRAINT ck_customer_types_profit
        CHECK(profit_percent >= 0)
);

CREATE INDEX idx_customer_types_active
ON customer_types(is_active);

CREATE INDEX idx_customer_types_deleted
ON customer_types(deleted_at);

-- =====================================================
-- TABLE : contacts
-- =====================================================

CREATE TABLE contacts
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    code                TEXT NOT NULL,

    display_name        TEXT NOT NULL,

    national_id         TEXT,
    phone               TEXT,
    mobile              TEXT,
    email               TEXT,
    address             TEXT,
    description         TEXT,

    is_active           INTEGER NOT NULL DEFAULT 1,

    created_at          TEXT NOT NULL,
    updated_at          TEXT,
    deleted_at          TEXT,

    CONSTRAINT uq_contacts_code
        UNIQUE(code)
);

CREATE INDEX idx_contacts_name
ON contacts(display_name);

CREATE INDEX idx_contacts_mobile
ON contacts(mobile);

CREATE INDEX idx_contacts_active
ON contacts(is_active);

CREATE INDEX idx_contacts_deleted
ON contacts(deleted_at);

-- =====================================================
-- TABLE : customer_profiles
-- =====================================================

CREATE TABLE customer_profiles
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    contact_id              INTEGER NOT NULL,

    customer_type_id        INTEGER NOT NULL,

    custom_profit_percent   REAL,

    credit_limit            REAL,

    created_at              TEXT NOT NULL,
    updated_at              TEXT,

    CONSTRAINT uq_customer_profile
        UNIQUE(contact_id),

    FOREIGN KEY(contact_id)
        REFERENCES contacts(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(customer_type_id)
        REFERENCES customer_types(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE INDEX idx_customer_profiles_customer_type
ON customer_profiles(customer_type_id);

-- =====================================================
-- TABLE : units
-- =====================================================

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

CREATE INDEX idx_units_active
ON units(is_active);

CREATE INDEX idx_units_deleted
ON units(deleted_at);

-- =====================================================
-- TABLE : categories
-- =====================================================

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

CREATE INDEX idx_categories_active
ON categories(is_active);

CREATE INDEX idx_categories_deleted
ON categories(deleted_at);

-- =====================================================
-- TABLE : products
-- =====================================================

CREATE TABLE products
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    code                    TEXT NOT NULL,

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


-- =====================================================
-- TABLE : currencies
-- =====================================================

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

    CONSTRAINT uq_currencies_code
        UNIQUE(code)
);

CREATE INDEX idx_currencies_active
ON currencies(is_active);

CREATE INDEX idx_currencies_deleted
ON currencies(deleted_at);

-- =====================================================
-- TABLE : currency_rates
-- =====================================================

CREATE TABLE currency_rates
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    currency_id         INTEGER NOT NULL,

    rate                REAL NOT NULL,

    effective_at        TEXT NOT NULL,

    description         TEXT,

    is_active           INTEGER NOT NULL DEFAULT 1,

    created_at          TEXT NOT NULL,

    FOREIGN KEY(currency_id)
        REFERENCES currencies(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(rate > 0)
);

CREATE INDEX idx_currency_rates_currency
ON currency_rates(currency_id);

CREATE INDEX idx_currency_rates_active
ON currency_rates(is_active);

CREATE INDEX idx_currency_rates_effective
ON currency_rates(effective_at);

-- =====================================================
-- TABLE : purchase_invoices
-- =====================================================

CREATE TABLE purchase_invoices
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    invoice_number      TEXT NOT NULL,

    contact_id          INTEGER NOT NULL,

    currency_id         INTEGER NOT NULL,

    currency_rate_id    INTEGER NOT NULL,

    currency_rate       REAL NOT NULL,

    invoice_date        TEXT NOT NULL,

    description         TEXT,

    status              TEXT NOT NULL DEFAULT 'Draft',

    created_at          TEXT NOT NULL,
    updated_at          TEXT,

    CONSTRAINT uq_purchase_invoice_number
        UNIQUE(invoice_number),

    CHECK(status IN ('Draft','Confirmed','Cancelled')),

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
        ON DELETE RESTRICT
);

CREATE INDEX idx_purchase_contact
ON purchase_invoices(contact_id);

CREATE INDEX idx_purchase_date
ON purchase_invoices(invoice_date);

CREATE INDEX idx_purchase_status
ON purchase_invoices(status);

-- =====================================================
-- TABLE : purchase_invoice_items
-- =====================================================

CREATE TABLE purchase_invoice_items
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    purchase_invoice_id     INTEGER NOT NULL,

    product_id              INTEGER NOT NULL,

    quantity                REAL NOT NULL,

    unit_cost               REAL NOT NULL,

    line_total              REAL NOT NULL,

    description             TEXT,

    FOREIGN KEY(purchase_invoice_id)
        REFERENCES purchase_invoices(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(quantity > 0),

    CHECK(unit_cost >= 0)
);

CREATE INDEX idx_purchase_items_invoice
ON purchase_invoice_items(purchase_invoice_id);

CREATE INDEX idx_purchase_items_product
ON purchase_invoice_items(product_id);

-- =====================================================
-- TABLE : purchase_costs
-- =====================================================

CREATE TABLE purchase_costs
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    purchase_invoice_id     INTEGER NOT NULL,

    title                   TEXT NOT NULL,

    amount                  REAL NOT NULL,

    description             TEXT,

    FOREIGN KEY(purchase_invoice_id)
        REFERENCES purchase_invoices(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(amount >= 0)
);

CREATE INDEX idx_purchase_costs_invoice
ON purchase_costs(purchase_invoice_id);

-- =====================================================
-- TABLE : inventory_lots
-- =====================================================

CREATE TABLE inventory_lots
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    purchase_invoice_item_id     INTEGER NOT NULL,

    product_id                  INTEGER NOT NULL,

    purchase_currency_id         INTEGER NOT NULL,

    purchase_currency_rate       REAL NOT NULL,

    unit_cost                   REAL NOT NULL,

    initial_quantity            REAL NOT NULL,

    remaining_quantity          REAL NOT NULL,

    received_at                 TEXT NOT NULL,

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

    CHECK(remaining_quantity >= 0)
);

CREATE INDEX idx_inventory_lots_product
ON inventory_lots(product_id);

CREATE INDEX idx_inventory_lots_remaining
ON inventory_lots(remaining_quantity);

CREATE INDEX idx_inventory_lots_received
ON inventory_lots(received_at);

-- =====================================================
-- TABLE : inventory_transactions
-- =====================================================

CREATE TABLE inventory_transactions
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    product_id          INTEGER NOT NULL,

    lot_id              INTEGER,

    transaction_type    TEXT NOT NULL,

    quantity            REAL NOT NULL,

    reference_table     TEXT,

    reference_id        INTEGER,

    transaction_date    TEXT NOT NULL,

    description         TEXT,

    FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(lot_id)
        REFERENCES inventory_lots(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE INDEX idx_inventory_tx_product
ON inventory_transactions(product_id);

CREATE INDEX idx_inventory_tx_lot
ON inventory_transactions(lot_id);

CREATE INDEX idx_inventory_tx_date
ON inventory_transactions(transaction_date);

 -- =====================================================
-- TABLE : sales_invoices
-- =====================================================

CREATE TABLE sales_invoices
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    invoice_number      TEXT NOT NULL,

    contact_id          INTEGER NOT NULL,

    currency_id         INTEGER NOT NULL,

    currency_rate_id    INTEGER NOT NULL,

    currency_rate       REAL NOT NULL,

    invoice_date        TEXT NOT NULL,

    description         TEXT,

    status              TEXT NOT NULL DEFAULT 'Draft',

    created_at          TEXT NOT NULL,
    updated_at          TEXT,

    CONSTRAINT uq_sales_invoice_number
        UNIQUE(invoice_number),

    CHECK(status IN ('Draft','Confirmed','Cancelled')),

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
        ON DELETE RESTRICT
);

CREATE INDEX idx_sales_contact
ON sales_invoices(contact_id);

CREATE INDEX idx_sales_date
ON sales_invoices(invoice_date);

CREATE INDEX idx_sales_status
ON sales_invoices(status);

-- =====================================================
-- TABLE : sales_invoice_items
-- =====================================================

CREATE TABLE sales_invoice_items
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    sales_invoice_id            INTEGER NOT NULL,

    product_id                  INTEGER NOT NULL,

    quantity                    REAL NOT NULL,

    purchase_unit_cost          REAL NOT NULL,

    purchase_currency_id        INTEGER NOT NULL,

    purchase_currency_rate      REAL NOT NULL,

    suggested_unit_price        REAL NOT NULL,

    sale_unit_price             REAL NOT NULL,

    line_total                  REAL NOT NULL,

    description                 TEXT,

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

    CHECK(sale_unit_price >= 0)
);

CREATE INDEX idx_sales_items_invoice
ON sales_invoice_items(sales_invoice_id);

CREATE INDEX idx_sales_items_product
ON sales_invoice_items(product_id);

-- =====================================================
-- TABLE : sales_inventory_allocations
-- =====================================================

CREATE TABLE sales_inventory_allocations
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,

    sales_invoice_item_id        INTEGER NOT NULL,

    inventory_lot_id            INTEGER NOT NULL,

    quantity                    REAL NOT NULL,

    purchase_unit_cost          REAL NOT NULL,

    FOREIGN KEY(sales_invoice_item_id)
        REFERENCES sales_invoice_items(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    FOREIGN KEY(inventory_lot_id)
        REFERENCES inventory_lots(id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,

    CHECK(quantity > 0)
);

CREATE INDEX idx_sales_alloc_item
ON sales_inventory_allocations(sales_invoice_item_id);

CREATE INDEX idx_sales_alloc_lot
ON sales_inventory_allocations(inventory_lot_id);

-- =====================================================
-- TABLE : currency_conversions
-- =====================================================

CREATE TABLE currency_conversions
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,

    conversion_number       TEXT NOT NULL,

    from_currency_id        INTEGER NOT NULL,

    to_currency_id          INTEGER NOT NULL,

    from_amount             REAL NOT NULL,

    expected_rate_id        INTEGER NOT NULL,

    expected_rate           REAL NOT NULL,

    expected_to_amount      REAL NOT NULL,

    actual_to_amount        REAL NOT NULL,

    difference_amount       REAL NOT NULL,

    conversion_date         TEXT NOT NULL,

    description             TEXT,

    created_at              TEXT NOT NULL,

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
        ON DELETE RESTRICT
);

CREATE INDEX idx_conversion_date
ON currency_conversions(conversion_date);

CREATE INDEX idx_conversion_from
ON currency_conversions(from_currency_id);

CREATE INDEX idx_conversion_to
ON currency_conversions(to_currency_id);

-- =====================================================
-- TABLE : settings
-- =====================================================

CREATE TABLE settings
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,

    key             TEXT NOT NULL,

    value           TEXT,

    description     TEXT,

    updated_at      TEXT NOT NULL,

    CONSTRAINT uq_settings_key
        UNIQUE(key)
);

CREATE INDEX idx_settings_key
ON settings(key);

COMMIT;