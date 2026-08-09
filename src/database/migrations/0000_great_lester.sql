CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_categories_name` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`display_name` text NOT NULL,
	`national_id` text,
	`economic_code` text,
	`phone` text,
	`mobile` text,
	`email` text,
	`address` text,
	`postal_code` text,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_contacts_code` ON `contacts` (`code`);--> statement-breakpoint
CREATE INDEX `idx_contacts_name` ON `contacts` (`display_name`);--> statement-breakpoint
CREATE INDEX `idx_contacts_mobile` ON `contacts` (`mobile`);--> statement-breakpoint
CREATE INDEX `idx_contacts_active` ON `contacts` (`is_active`);--> statement-breakpoint
CREATE TABLE `customer_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`customer_type_id` integer NOT NULL,
	`custom_profit_percent` real,
	`credit_limit` real DEFAULT 0,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_type_id`) REFERENCES `customer_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_customer_profile` ON `customer_profiles` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_customer_profile_type` ON `customer_profiles` (`customer_type_id`);--> statement-breakpoint
CREATE TABLE `customer_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`profit_percent` real DEFAULT 0 NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_customer_types_name` ON `customer_types` (`name`);--> statement-breakpoint
CREATE INDEX `idx_customer_types_active` ON `customer_types` (`is_active`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category_id` integer,
	`unit_id` integer NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_products_name` ON `products` (`name`);--> statement-breakpoint
CREATE INDEX `idx_products_category` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_unit` ON `products` (`unit_id`);--> statement-breakpoint
CREATE TABLE `units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_units_name` ON `units` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_units_symbol` ON `units` (`symbol`);--> statement-breakpoint
CREATE TABLE `currencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`symbol` text,
	`is_base` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_currencies_code` ON `currencies` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_currencies_name` ON `currencies` (`name`);--> statement-breakpoint
CREATE INDEX `idx_currencies_code` ON `currencies` (`code`);--> statement-breakpoint
CREATE INDEX `idx_currencies_active` ON `currencies` (`is_active`);--> statement-breakpoint
CREATE TABLE `currency_rates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`currency_id` integer NOT NULL,
	`rate` real NOT NULL,
	`effective_at` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_currency_rates_currency` ON `currency_rates` (`currency_id`);--> statement-breakpoint
CREATE INDEX `idx_currency_rates_effective` ON `currency_rates` (`effective_at`);--> statement-breakpoint
CREATE INDEX `idx_currency_rates_lookup` ON `currency_rates` (`currency_id`,`id`);--> statement-breakpoint
CREATE TABLE `purchase_costs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_invoice_id` integer NOT NULL,
	`title` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`purchase_invoice_id`) REFERENCES `purchase_invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_purchase_cost_invoice` ON `purchase_costs` (`purchase_invoice_id`);--> statement-breakpoint
CREATE TABLE `purchase_invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_invoice_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` real NOT NULL,
	`unit_cost` real NOT NULL,
	`allocated_cost` real DEFAULT 0 NOT NULL,
	`final_unit_cost` real NOT NULL,
	`line_total` real NOT NULL,
	`description` text,
	FOREIGN KEY (`purchase_invoice_id`) REFERENCES `purchase_invoices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_purchase_items_invoice` ON `purchase_invoice_items` (`purchase_invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_items_product` ON `purchase_invoice_items` (`product_id`);--> statement-breakpoint
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
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_rate_id`) REFERENCES `currency_rates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_purchase_invoice_number` ON `purchase_invoices` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `idx_purchase_contact` ON `purchase_invoices` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_currency` ON `purchase_invoices` (`currency_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_date` ON `purchase_invoices` (`invoice_date`);--> statement-breakpoint
CREATE INDEX `idx_purchase_status` ON `purchase_invoices` (`status`);--> statement-breakpoint
CREATE TABLE `inventory_lots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_invoice_item_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`purchase_currency_id` integer NOT NULL,
	`purchase_currency_rate` real NOT NULL,
	`unit_cost` real NOT NULL,
	`allocated_cost` real DEFAULT 0 NOT NULL,
	`final_unit_cost` real NOT NULL,
	`initial_quantity` real NOT NULL,
	`remaining_quantity` real NOT NULL,
	`received_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`purchase_invoice_item_id`) REFERENCES `purchase_invoice_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`purchase_currency_id`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_lots_product` ON `inventory_lots` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_lots_fifo` ON `inventory_lots` (`product_id`,`received_at`,`id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_lots_remaining` ON `inventory_lots` (`product_id`,`remaining_quantity`);--> statement-breakpoint
CREATE TABLE `inventory_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`inventory_lot_id` integer,
	`transaction_type` text NOT NULL,
	`quantity` real NOT NULL,
	`reference_table` text NOT NULL,
	`reference_id` integer NOT NULL,
	`transaction_date` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inventory_lot_id`) REFERENCES `inventory_lots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_tx_product` ON `inventory_transactions` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_tx_lot` ON `inventory_transactions` (`inventory_lot_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_tx_date` ON `inventory_transactions` (`transaction_date`);--> statement-breakpoint
CREATE INDEX `idx_inventory_tx_reference` ON `inventory_transactions` (`reference_table`,`reference_id`);--> statement-breakpoint
CREATE TABLE `sales_inventory_allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sales_invoice_item_id` integer NOT NULL,
	`inventory_lot_id` integer NOT NULL,
	`quantity` real NOT NULL,
	`fifo_unit_cost` real NOT NULL,
	`fifo_total_cost` real NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`sales_invoice_item_id`) REFERENCES `sales_invoice_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inventory_lot_id`) REFERENCES `inventory_lots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sales_alloc_item` ON `sales_inventory_allocations` (`sales_invoice_item_id`);--> statement-breakpoint
CREATE INDEX `idx_sales_alloc_lot` ON `sales_inventory_allocations` (`inventory_lot_id`);--> statement-breakpoint
CREATE TABLE `sales_invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sales_invoice_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` real NOT NULL,
	`fifo_unit_cost` real NOT NULL,
	`purchase_currency_id` integer NOT NULL,
	`purchase_currency_rate` real NOT NULL,
	`sale_exchange_rate` real NOT NULL,
	`customer_profit_percent` real NOT NULL,
	`suggested_unit_price` real NOT NULL,
	`sale_unit_price` real NOT NULL,
	`line_total` real NOT NULL,
	`description` text,
	FOREIGN KEY (`sales_invoice_id`) REFERENCES `sales_invoices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`purchase_currency_id`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sales_items_invoice` ON `sales_invoice_items` (`sales_invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_sales_items_product` ON `sales_invoice_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `sales_invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text NOT NULL,
	`contact_id` integer NOT NULL,
	`currency_rate_id` integer NOT NULL,
	`currency_rate` real NOT NULL,
	`invoice_date` text NOT NULL,
	`description` text,
	`deleted_at` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_rate_id`) REFERENCES `currency_rates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_sales_invoice_number` ON `sales_invoices` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `idx_sales_contact` ON `sales_invoices` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_sales_date` ON `sales_invoices` (`invoice_date`);--> statement-breakpoint
CREATE INDEX `idx_sales_status` ON `sales_invoices` (`status`);--> statement-breakpoint
CREATE TABLE `currency_conversions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversion_number` text NOT NULL,
	`conversion_date` text NOT NULL,
	`from_currency_id` integer NOT NULL,
	`to_currency_id` integer NOT NULL,
	`source_amount` real NOT NULL,
	`expected_rate_id` integer NOT NULL,
	`expected_rate` real NOT NULL,
	`expected_destination_amount` real NOT NULL,
	`actual_destination_amount` real NOT NULL,
	`difference_amount` real NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`from_currency_id`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_currency_id`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`expected_rate_id`) REFERENCES `currency_rates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_currency_conversion_number` ON `currency_conversions` (`conversion_number`);--> statement-breakpoint
CREATE INDEX `idx_currency_conversion_date` ON `currency_conversions` (`conversion_date`);--> statement-breakpoint
CREATE INDEX `idx_currency_conversion_from` ON `currency_conversions` (`from_currency_id`);--> statement-breakpoint
CREATE INDEX `idx_currency_conversion_to` ON `currency_conversions` (`to_currency_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setting_key` text NOT NULL,
	`setting_value` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_settings_key` ON `settings` (`setting_key`);--> statement-breakpoint
CREATE INDEX `idx_settings_key` ON `settings` (`setting_key`);