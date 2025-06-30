import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { ChatCompletionMessageToolCall } from 'openai/resources/index.mjs';
import { ModelResponseStructure } from '../llm/structured_output';

// threads table definition
export const threads = sqliteTable('threads', {
  id: text('id').primaryKey(),
  project_id: text('project_id').notNull(),
  title: text('title').notNull(),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'number' }).notNull(),
  updated_at: integer('updated_at', { mode: 'number' }).notNull(),
  model_id: text('model_id').notNull(),
  context_config: blob('value', { mode: 'json' })
    .default({})
    .$type<Record<string, boolean>>(),
  workspaces: text('workspaces', { mode: 'json' })
    .$type<string[] | null>()
    .notNull()
    .default([]), // always a JSON array
});

export type FilesMapDiagnostics = Record<string, DiagnosticMessage[]>;
export type DiagnosticsByHookName = Record<string, FilesMapDiagnostics>;
export type StructuredOutputMetadata = {
  raw: string; // the raw JSON string of the structured output
  source_sha1: Record<string, string>; // sha1 hashes of the source files
  parsed: ModelResponseStructure; // the parsed structured output
  diagnostics: DiagnosticsByHookName; // diagnostics for each hook
  resolved_edited_files?: { path: string; content: string }[]; // resolved edited files
  resolved_edited_ranges?: { path: string; content: string }[]; // resolved edited ranges
};
// messages table definition
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  thread_id: text('thread_id').notNull(),
  created_at: integer('created_at', { mode: 'number' }).notNull(),
  content: text('content').$type<string | null>(),
  images_urls: text('images_urls', { mode: 'json' }).$type<string[] | null>(),
  role: text('role').notNull().$type<'user' | 'assistant' | 'tool'>(),
  // for JSON/array columns you might store as JSON text
  tool_calls: blob('tool_calls', { mode: 'json' }).$type<
    ChatCompletionMessageToolCall[] | null
  >(),
  refusal: text('refusal').$type<string | null>(),
  tool_call_id: text('tool_call_id').$type<string | null>(),
  index: integer('index').notNull(),
  metadata: blob('metadata', {
    mode: 'json',
  }).$type<StructuredOutputMetadata>(),
});

export const customSystemParts = sqliteTable('custom_system_parts', {
  id: text('id').primaryKey(),
  project_id: text('project_id').notNull(),
  type: text('type').notNull().$type<'file' | 'raw'>(),
  key: text('key').notNull(),
  value: text('value').notNull(),
});

export const contextConfig = sqliteTable('context_config', {
  id: text('id').primaryKey(),
  project_id: text('project_id').notNull(),
  config: blob('config', { mode: 'json' })
    .notNull()
    .$type<Record<string, boolean>>(),
});

export type DiagnosticMessage = {
  type: 'error' | 'warning';
  message: string;
  line: number;
  column: number;
};

export type CustomSystemPart = InferSelectModel<typeof customSystemParts>;
export type CustomSystemPartInsert = InferInsertModel<typeof customSystemParts>;

export type ContextConfig = InferSelectModel<typeof contextConfig>;
export type ContextConfigInsert = InferInsertModel<typeof contextConfig>;

// Infer TypeScript types from the schema:
export type Thread = InferSelectModel<typeof threads>;
export type ThreadInsert = InferInsertModel<typeof threads>;

export type Message = InferSelectModel<typeof messages>;
export type MessageInsert = InferInsertModel<typeof messages>;
