// src/database/client.ts
import path from "node:path";
import { app } from "electron";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";

const dbPath = app.isPackaged
  ? path.join(app.getPath("userData"), "accounting.db")
  : path.join(process.cwd(), "dev.db");

const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });
function getMigrationsFolder() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "migrations")
    : path.join(process.cwd(), "src", "database", "migrations");
}
export async function runMigrations() {
  const migrationsFolder = getMigrationsFolder();
  console.log("Migrations folder resolved to:", migrationsFolder);
  await migrate(db, { migrationsFolder });
}
