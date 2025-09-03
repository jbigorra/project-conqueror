import { getTestDatabase } from "#shared/database/db.ts";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

export async function setupTestDatabase() {
  const db = getTestDatabase();
  await migrate(db, { migrationsFolder: "./db-migrations" });

  return db;
}
