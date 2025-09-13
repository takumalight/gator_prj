// typescript
import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config";

let url: string;
try {
  const cfg = readConfig();
  url = cfg.dbUrl;
  console.log("Drizzle using DB URL from config");
} catch (e) {
  console.error("readConfig failed:", e);
  url = "postgres://postgres:admin@localhost:5432/gator";
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
});