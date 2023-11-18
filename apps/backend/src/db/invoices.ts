import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { payments } from "./payments";
import { acceptedTokens, selectAcceptedTokenSchema } from "./schema";

const CURRENCY_ENUM = ["USD", "EUR", "JPY", "CAD"] as const;
export type Currency = (typeof CURRENCY_ENUM)[number];
export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey().notNull(),
  payerEmail: text("payer_email"),
  payerName: text("payer_name"),
  payerWallet: text("recipient_wallet"), // this is optional, in case you know the wallet address of the payee
  description: text("description").notNull(),
  amountDue: integer("amount_due", { mode: "number" }).notNull(),
  currency: text("currency", { enum: ["USD", "EUR", "JPY", "CAD"] }).notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }),
  wallet: text("wallet").notNull(), // Address for receiving payments // safe sdk
  status: text("status", { enum: ["pending", "paid", "handled"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});

export const selectInvoiceSchema = createSelectSchema(invoices, {
  id: (schema) => schema.id.uuid(),
  currency: () => z.enum(CURRENCY_ENUM),
  dueDate: z.coerce.date(),
  createdAt: () => z.coerce.date().default(new Date()),
  updatedAt: () => z.coerce.date().default(new Date()),
});

export const insertInvoiceSchema = createInsertSchema(invoices, {
  id: (schema) => schema.id.uuid(),
  currency: () => z.enum(CURRENCY_ENUM),
  amountDue: z.coerce.number(),
  dueDate: z.coerce.date(),
  createdAt: () => z.coerce.date().default(new Date()),
}).omit({ id: true });

export const invoicesRelations = relations(invoices, ({ many }) => ({
  payments: many(payments),
  acceptedTokens: many(acceptedTokens),
}));

export type selectInvoiceSchema = z.infer<typeof selectInvoiceSchema>;
