CREATE TABLE `uploads` (
	`id` integer PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uploads_identifier_unique` ON `uploads` (`identifier`);