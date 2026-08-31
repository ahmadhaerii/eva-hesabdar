import { relations } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

/* ==========================================================
   CUSTOMER TYPES
========================================================== */

export const customerTypes = sqliteTable(
  "customer_types",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    name: text("name").notNull(),

    profitPercent: real("profit_percent").notNull().default(0),

    description: text("description"),

    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),

    deletedAt: text("deleted_at"),
  },
  (table) => ({
    nameUnique: uniqueIndex("uq_customer_types_name").on(table.name),
    activeIndex: index("idx_customer_types_active").on(table.isActive),
  }),
);

/* ==========================================================
   CUSTOMERS
========================================================== */

export const customers = sqliteTable(
  "customers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    code: text("code").notNull(),

    displayName: text("display_name").notNull(),

    nationalId: text("national_id"),

    customerTypeId: integer("customer_type_id")
      .notNull()
      .references(() => customerTypes.id),

    customProfitPercent: real("custom_profit_percent"),

    phone: text("phone"),

    mobile: text("mobile"),

    email: text("email"),

    address: text("address"),

    postalCode: text("postal_code"),

    description: text("description"),

    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),

    deletedAt: text("deleted_at"),
  },
  (table) => ({
    codeUnique: uniqueIndex("uq_customers_code").on(table.code),
    nameIndex: index("idx_customers_name").on(table.displayName),
    mobileIndex: index("idx_customers_mobile").on(table.mobile),
    activeIndex: index("idx_customers_active").on(table.isActive),
    typeIndex: index("idx_customer_type").on(table.customerTypeId),
  }),
);

/* ==========================================================
   UNITS
========================================================== */

export const units = sqliteTable(
  "units",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    name: text("name").notNull(),

    symbol: text("symbol").notNull(),

    description: text("description"),

    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),

    deletedAt: text("deleted_at"),
  },
  (table) => ({
    nameUnique: uniqueIndex("uq_units_name").on(table.name),

    symbolUnique: uniqueIndex("uq_units_symbol").on(table.symbol),
  }),
);

/* ==========================================================
   CATEGORIES
========================================================== */

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    name: text("name").notNull(),

    description: text("description"),

    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),

    deletedAt: text("deleted_at"),
  },
  (table) => ({
    nameUnique: uniqueIndex("uq_categories_name").on(table.name),
  }),
);

/* ==========================================================
   PRODUCTS
========================================================== */

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    name: text("name").notNull(),

    categoryId: integer("category_id"),

    unitId: integer("unit_id").notNull(),

    description: text("description"),

    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    createdAt: text("created_at").notNull(),

    updatedAt: text("updated_at"),

    deletedAt: text("deleted_at"),
  },
  (table) => ({
    nameIndex: index("idx_products_name").on(table.name),

    categoryIndex: index("idx_products_category").on(table.categoryId),

    unitIndex: index("idx_products_unit").on(table.unitId),
  }),
);
