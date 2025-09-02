import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const uploads = sqliteTable("uploads", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").unique().notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at"),
  deletedAt: integer("deleted_at"),
});
