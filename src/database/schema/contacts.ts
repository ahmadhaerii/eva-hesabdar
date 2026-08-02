// src/database/schema/contacts.ts
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const contacts = sqliteTable(
  "contacts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    displayName: text("display_name").notNull(),
    nationalId: text("national_id"),
    phone: text("phone"),
    mobile: text("mobile"),
    email: text("email"),
    address: text("address"),
    description: text("description"),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    uniqueIndex("uq_contacts_code").on(table.code),
    index("idx_contacts_name").on(table.displayName),
    index("idx_contacts_mobile").on(table.mobile),
    index("idx_contacts_active").on(table.isActive),
    index("idx_contacts_deleted").on(table.deletedAt),
  ],
);
