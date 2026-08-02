// src/database/schema/customer-profiles.ts
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { contacts } from "./contacts";
import { customerTypes } from "./customer-types";

export const customerProfiles = sqliteTable(
  "customer_profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    customerTypeId: integer("customer_type_id")
      .notNull()
      .references(() => customerTypes.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    customProfitPercent: real("custom_profit_percent"),
    creditLimit: real("credit_limit"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at"),
  },
  (table) => [
    uniqueIndex("uq_customer_profile").on(table.contactId),
    index("idx_customer_profiles_customer_type").on(table.customerTypeId),
  ],
);
