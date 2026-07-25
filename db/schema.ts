import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const sharedConfigEntries = sqliteTable("shared_config_entries", {
  orgKey: text("org_key").primaryKey(),
  pathJson: text("path_json").notNull(),
  configJson: text("config_json").notNull(),
  rowsJson: text("rows_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});
