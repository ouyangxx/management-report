CREATE TABLE `shared_config_entries` (
	`org_key` text PRIMARY KEY NOT NULL,
	`path_json` text NOT NULL,
	`config_json` text NOT NULL,
	`rows_json` text NOT NULL,
	`updated_at` text NOT NULL
);
