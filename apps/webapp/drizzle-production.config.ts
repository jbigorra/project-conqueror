import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/**/infrastructure/db/**/*.schema.ts",
  out: "./db-migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "pq-production.sqlite",
  },
  strict: true,
});
