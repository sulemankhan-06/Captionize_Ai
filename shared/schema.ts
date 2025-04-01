import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping from existing file)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Transcription schema for our app
export const transcriptions = pgTable("transcriptions", {
  id: text("id").primaryKey(),  // Using text for UUID-style ID
  sourceUrl: text("source_url").notNull(),
  title: text("title"),
  duration: integer("duration"),
  status: text("status").notNull().default("processing"), // idle, processing, completed, failed
  progress: integer("progress").default(0),
  srtContent: text("srt_content"),
  captions: jsonb("captions"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).pick({
  sourceUrl: true,
  title: true,
});

export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;
export type Transcription = {
  id: string;
  sourceUrl: string;
  title?: string;
  duration?: number;
  status: "idle" | "processing" | "completed" | "failed";
  progress: number;
  srtContent?: string;
  captions?: Array<{
    id: number;
    start: string;
    text: string;
  }>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
};

// Schema for URL validation
export const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL")
});

export type UrlRequest = z.infer<typeof urlSchema>;

// Schema for transcription results
export const transcriptionResultSchema = z.object({
  id: z.string(),
  text: z.string(),
  words: z.array(z.object({
    text: z.string(),
    start: z.number(),
    end: z.number(),
    confidence: z.number()
  })).optional(),
  status: z.string(),
  utterances: z.array(z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
    speaker: z.string().optional()
  })).optional()
});

export type TranscriptionResult = z.infer<typeof transcriptionResultSchema>;
