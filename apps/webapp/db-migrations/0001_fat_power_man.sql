PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_uploads` (
	`id` integer PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_uploads`("id", "identifier", "created_at", "updated_at", "deleted_at") SELECT "id", "identifier", "created_at", "updated_at", "deleted_at" FROM `uploads`;--> statement-breakpoint
DROP TABLE `uploads`;--> statement-breakpoint
ALTER TABLE `__new_uploads` RENAME TO `uploads`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uploads_identifier_unique` ON `uploads` (`identifier`);