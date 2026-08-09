import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const client = createClient({
  url: "file:dev.db",
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
