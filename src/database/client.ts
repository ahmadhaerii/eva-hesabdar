import path from "node:path";
import { app } from "electron";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const dbPath = path.join(app.getPath("userData"), "database.db");

console.log("📁 Database path:", dbPath);

const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, {
  schema,

  logger: {
    logQuery(query, params) {
      console.log("🔍 Query:", query);
      console.log("📊 Params:", params);
    },
  },
});

export { client };
