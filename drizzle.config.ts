// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/database/schema/index.ts",
  out: "./src/database/migrations",
  dbCredentials: {
    url: "file:./dev.db", // پیشوند file: برای libsql لازمه
  },
});
