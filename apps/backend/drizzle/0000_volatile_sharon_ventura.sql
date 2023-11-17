CREATE TABLE `accepted_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`chain` text NOT NULL,
	`invoice_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`payer_email` text,
	`payer_name` text,
	`recipient_wallet` text,
	`description` text NOT NULL,
	`amount_due` integer NOT NULL,
	`currency` text NOT NULL,
	`due_date` integer,
	`wallet` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`amount_paid` integer NOT NULL,
	`payment_date` integer NOT NULL,
	`payment_method` text NOT NULL,
	`transaction_id` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
