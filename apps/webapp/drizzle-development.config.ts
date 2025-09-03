import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/**/infrastructure/db/schemas/*.sql.ts",
  out: "./db-migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "pq-development.sqlite",
  },
  strict: true,
});
