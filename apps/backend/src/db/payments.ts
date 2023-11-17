import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { invoices } from "./invoices";

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().notNull(),
  invoiceId: text("invoice_id")
    .references(() => invoices.id)
    .notNull(),
  amountPaid: integer("amount_paid", { mode: "number" }).notNull(),
  paymentDate: integer("payment_date", { mode: "timestamp" }).notNull(),
  paymentMethod: text("payment_method").notNull(), // e.g., 'wallet', 'credit_card'
  transactionId: text("transaction_id"), // For blockchain or other payment gateway transaction references
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments, {
  id: (schema) => schema.id.uuid(),
  createdAt: () => z.coerce.date().default(new Date()),
}).omit({ id: true });

export const selectPaymentSchema = createSelectSchema(payments, {
  createdAt: () => z.coerce.date().default(new Date()),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));
