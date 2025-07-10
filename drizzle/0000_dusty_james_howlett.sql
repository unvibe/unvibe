CREATE TABLE `context_config` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`config` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `custom_system_parts` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`type` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`content` text,
	`images_urls` text,
	`role` text NOT NULL,
	`tool_calls` blob,
	`refusal` text,
	`tool_call_id` text,
	`index` integer NOT NULL,
	`metadata` blob
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`path` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`model_id` text NOT NULL,
	`value` blob DEFAULT '{}',
	`workspaces` text DEFAULT '[]' NOT NULL
);
