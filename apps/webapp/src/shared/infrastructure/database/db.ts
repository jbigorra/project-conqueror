import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

export function createDevelopmentDatabase() {
  return drizzle({ client: new Database("pq-development.sqlite") });
}

export function createProductionDatabase() {
  return drizzle({ client: new Database("pq-production.sqlite") });
}

export function createTestDatabase() {
  return drizzle({ client: new Database(":memory:") });
}
