import path from "node:path";
import { app } from "electron";
import { migrate } from "drizzle-orm/libsql/migrator";

import { db } from "./client";

export async function runMigrations() {
  const migrationsFolder = app.isPackaged
    ? path.join(process.resourcesPath, "migrations")
    : path.join(process.cwd(), "src", "database", "migrations");

  console.log("📦 Migrations folder:", migrationsFolder);

  await migrate(db, {
    migrationsFolder,
  });

  console.log("✅ Database migrations completed");
}
