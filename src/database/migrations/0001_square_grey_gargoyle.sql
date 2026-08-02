CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`display_name` text NOT NULL,
	`national_id` text,
	`phone` text,
	`mobile` text,
	`email` text,
	`address` text,
	`description` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_contacts_code` ON `contacts` (`code`);--> statement-breakpoint
CREATE INDEX `idx_contacts_name` ON `contacts` (`display_name`);--> statement-breakpoint
CREATE INDEX `idx_contacts_mobile` ON `contacts` (`mobile`);--> statement-breakpoint
CREATE INDEX `idx_contacts_active` ON `contacts` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_contacts_deleted` ON `contacts` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `customer_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`customer_type_id` integer NOT NULL,
	`custom_profit_percent` real,
	`credit_limit` real,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`customer_type_id`) REFERENCES `customer_types`(`id`) ON UPDATE restrict ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_customer_profile` ON `customer_profiles` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_customer_profiles_customer_type` ON `customer_profiles` (`customer_type_id`);--> statement-breakpoint
CREATE TABLE `units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_units_name` ON `units` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_units_symbol` ON `units` (`symbol`);--> statement-breakpoint
CREATE INDEX `idx_units_active` ON `units` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_units_deleted` ON `units` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_categories_name` ON `categories` (`name`);--> statement-breakpoint
CREATE INDEX `idx_categories_active` ON `categories` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_categories_deleted` ON `categories` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`category_id` integer,
	`unit_id` integer NOT NULL,
	`description` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE restrict ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_products_code` ON `products` (`code`);--> statement-breakpoint
CREATE INDEX `idx_products_name` ON `products` (`name`);--> statement-breakpoint
CREATE INDEX `idx_products_category` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_unit` ON `products` (`unit_id`);--> statement-breakpoint
CREATE INDEX `idx_products_active` ON `products` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_products_deleted` ON `products` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `currencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`symbol` text,
	`is_base` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_currencies_code` ON `currencies` (`code`);--> statement-breakpoint
CREATE INDEX `idx_currencies_active` ON `currencies` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_currencies_deleted` ON `currencies` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `currency_rates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`currency_id` integer NOT NULL,
	`rate` real NOT NULL,
	`effective_at` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON UPDATE restrict ON DELETE restrict,
	CONSTRAINT "ck_currency_rates_rate" CHECK("currency_rates"."rate" > 0)
);
--> statement-breakpoint
CREATE INDEX `idx_currency_rates_currency` ON `currency_rates` (`currency_id`);--> statement-breakpoint
CREATE INDEX `idx_currency_rates_active` ON `currency_rates` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_currency_rates_effective` ON `currency_rates` (`effective_at`);--> statement-breakpoint
CREATE TABLE `purchase_invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text NOT NULL,
	`contact_id` integer NOT NULL,
	`currency_id` integer NOT NULL,
	`currency_rate_id` integer NOT NULL,
	`currency_rate` real NOT NULL,
	`invoice_date` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`currency_rate_id`) REFERENCES `currency_rates`(`id`) ON UPDATE restrict ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_purchase_invoice_number` ON `purchase_invoices` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `idx_purchase_contact` ON `purchase_invoices` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_date` ON `purchase_invoices` (`invoice_date`);--> statement-breakpoint
CREATE INDEX `idx_purchase_status` ON `purchase_invoices` (`status`);--> statement-breakpoint
CREATE TABLE `purchase_invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_invoice_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` real NOT NULL,
	`unit_cost` real NOT NULL,
	`line_total` real NOT NULL,
	`description` text,
	FOREIGN KEY (`purchase_invoice_id`) REFERENCES `purchase_invoices`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE restrict ON DELETE restrict,
	CONSTRAINT "ck_purchase_items_quantity" CHECK("purchase_invoice_items"."quantity" > 0),
	CONSTRAINT "ck_purchase_items_unit_cost" CHECK("purchase_invoice_items"."unit_cost" >= 0)
);
--> statement-breakpoint
CREATE INDEX `idx_purchase_items_invoice` ON `purchase_invoice_items` (`purchase_invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_items_product` ON `purchase_invoice_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `purchase_costs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_invoice_id` integer NOT NULL,
	`title` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	FOREIGN KEY (`purchase_invoice_id`) REFERENCES `purchase_invoices`(`id`) ON UPDATE restrict ON DELETE restrict,
	CONSTRAINT "ck_purchase_costs_amount" CHECK("purchase_costs"."amount" >= 0)
);
--> statement-breakpoint
CREATE INDEX `idx_purchase_costs_invoice` ON `purchase_costs` (`purchase_invoice_id`);--> statement-breakpoint
CREATE TABLE `inventory_lots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_invoice_item_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`purchase_currency_id` integer NOT NULL,
	`purchase_currency_rate` real NOT NULL,
	`unit_cost` real NOT NULL,
	`initial_quantity` real NOT NULL,
	`remaining_quantity` real NOT NULL,
	`received_at` text NOT NULL,
	FOREIGN KEY (`purchase_invoice_item_id`) REFERENCES `purchase_invoice_items`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`purchase_currency_id`) REFERENCES `currencies`(`id`) ON UPDATE restrict ON DELETE restrict,
	CONSTRAINT "ck_inventory_lots_initial_qty" CHECK("inventory_lots"."initial_quantity" > 0),
	CONSTRAINT "ck_inventory_lots_remaining_qty" CHECK("inventory_lots"."remaining_quantity" >= 0)
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_lots_product` ON `inventory_lots` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_lots_remaining` ON `inventory_lots` (`remaining_quantity`);--> statement-breakpoint
CREATE INDEX `idx_inventory_lots_received` ON `inventory_lots` (`received_at`);--> statement-breakpoint
CREATE TABLE `inventory_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`lot_id` integer,
	`transaction_type` text NOT NULL,
	`quantity` real NOT NULL,
	`reference_table` text,
	`reference_id` integer,
	`transaction_date` text NOT NULL,
	`description` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`lot_id`) REFERENCES `inventory_lots`(`id`) ON UPDATE restrict ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_tx_product` ON `inventory_transactions` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_tx_lot` ON `inventory_transactions` (`lot_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_tx_date` ON `inventory_transactions` (`transaction_date`);--> statement-breakpoint
CREATE TABLE `sales_invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text NOT NULL,
	`contact_id` integer NOT NULL,
	`currency_id` integer NOT NULL,
	`currency_rate_id` integer NOT NULL,
	`currency_rate` real NOT NULL,
	`invoice_date` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`currency_rate_id`) REFERENCES `currency_rates`(`id`) ON UPDATE restrict ON DELETE restrict,
	CONSTRAINT "ck_sales_invoices_status" CHECK("sales_invoices"."status" IN ('Draft','Confirmed','Cancelled'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_sales_invoice_number` ON `sales_invoices` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `idx_sales_contact` ON `sales_invoices` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_sales_date` ON `sales_invoices` (`invoice_date`);--> statement-breakpoint
CREATE INDEX `idx_sales_status` ON `sales_invoices` (`status`);--> statement-breakpoint
CREATE TABLE `sales_invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sales_invoice_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` real NOT NULL,
	`purchase_unit_cost` real NOT NULL,
	`purchase_currency_id` integer NOT NULL,
	`purchase_currency_rate` real NOT NULL,
	`suggested_unit_price` real NOT NULL,
	`sale_unit_price` real NOT NULL,
	`line_total` real NOT NULL,
	`description` text,
	FOREIGN KEY (`sales_invoice_id`) REFERENCES `sales_invoices`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`purchase_currency_id`) REFERENCES `currencies`(`id`) ON UPDATE restrict ON DELETE restrict,
	CONSTRAINT "ck_sales_items_quantity" CHECK("sales_invoice_items"."quantity" > 0),
	CONSTRAINT "ck_sales_items_sale_price" CHECK("sales_invoice_items"."sale_unit_price" >= 0)
);
--> statement-breakpoint
CREATE INDEX `idx_sales_items_invoice` ON `sales_invoice_items` (`sales_invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_sales_items_product` ON `sales_invoice_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `sales_inventory_allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sales_invoice_item_id` integer NOT NULL,
	`inventory_lot_id` integer NOT NULL,
	`quantity` real NOT NULL,
	`purchase_unit_cost` real NOT NULL,
	FOREIGN KEY (`sales_invoice_item_id`) REFERENCES `sales_invoice_items`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`inventory_lot_id`) REFERENCES `inventory_lots`(`id`) ON UPDATE restrict ON DELETE restrict,
	CONSTRAINT "ck_sales_alloc_quantity" CHECK("sales_inventory_allocations"."quantity" > 0)
);
--> statement-breakpoint
CREATE INDEX `idx_sales_alloc_item` ON `sales_inventory_allocations` (`sales_invoice_item_id`);--> statement-breakpoint
CREATE INDEX `idx_sales_alloc_lot` ON `sales_inventory_allocations` (`inventory_lot_id`);--> statement-breakpoint
CREATE TABLE `currency_conversions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversion_number` text NOT NULL,
	`from_currency_id` integer NOT NULL,
	`to_currency_id` integer NOT NULL,
	`from_amount` real NOT NULL,
	`expected_rate_id` integer NOT NULL,
	`expected_rate` real NOT NULL,
	`expected_to_amount` real NOT NULL,
	`actual_to_amount` real NOT NULL,
	`difference_amount` real NOT NULL,
	`conversion_date` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`from_currency_id`) REFERENCES `currencies`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`to_currency_id`) REFERENCES `currencies`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`expected_rate_id`) REFERENCES `currency_rates`(`id`) ON UPDATE restrict ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_conversion_number` ON `currency_conversions` (`conversion_number`);--> statement-breakpoint
CREATE INDEX `idx_conversion_date` ON `currency_conversions` (`conversion_date`);--> statement-breakpoint
CREATE INDEX `idx_conversion_from` ON `currency_conversions` (`from_currency_id`);--> statement-breakpoint
CREATE INDEX `idx_conversion_to` ON `currency_conversions` (`to_currency_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`description` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_settings_key` ON `settings` (`key`);