import Database from "bun:sqlite";
import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";

let developmentDatabase: BunSQLiteDatabase | null = null;
let productionDatabase: BunSQLiteDatabase | null = null;

export function getDevelopmentDatabase() {
  developmentDatabase ??= drizzle({ client: new Database("pq-development.sqlite") });

  return developmentDatabase;
}

export function getProductionDatabase() {
  productionDatabase ??= drizzle({ client: new Database("pq-production.sqlite") });

  return productionDatabase;
}

export function getTestDatabase() {
  return drizzle({ client: new Database(":memory:") });
}
