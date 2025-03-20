import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const commits = pgTable("commits", {
  id: text("id").primaryKey(),
  message: text("message").notNull(),
  author: text("author").notNull(),
  authorEmail: text("author_email").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  repository: text("repository").notNull(),
  sha: text("sha").notNull(),
  url: text("url").notNull()
});

export const insertCommitSchema = createInsertSchema(commits);
export type InsertCommit = z.infer<typeof insertCommitSchema>;
export type Commit = typeof commits.$inferSelect;