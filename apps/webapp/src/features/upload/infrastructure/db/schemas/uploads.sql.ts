import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const uploads = sqliteTable("uploads", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").unique().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => sql`(unixepoch())`),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});
