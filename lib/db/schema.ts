import {
  integer,
  pgTable,
  varchar,
  timestamp,
  boolean,
  text,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";

export interface DocumentAnalysis {
  tokenCount: number;
  byteSize: number;
  charCount: number;
  wordCount: number;
}

export const documentsTable = pgTable(
  "documents",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar({ length: 255 }),
    content: text().notNull(),
    tokenCount: integer(),
    analysis: jsonb("analysis").$type<DocumentAnalysis>().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => ({    
    uniqueDocument: unique().on(table.id, table.userId),
  })
);

export const analysisLogsTable = pgTable("analysis_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  documentId: integer()
    .references(() => documentsTable.id)
    .notNull(),
  userId: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 20 }).notNull(), // 'pending', 'success', 'failed'
  details: text(),
  createdAt: timestamp().defaultNow().notNull(),
});