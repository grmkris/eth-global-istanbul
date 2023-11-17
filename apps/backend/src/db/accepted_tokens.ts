import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { invoices } from "./invoices";

export const acceptedTokens = sqliteTable("accepted_tokens", {
  id: text("id").primaryKey().notNull(),
  token: text("token").notNull(),
  chain: text("chain").notNull(),
  invoiceId: text("invoice_id")
    .references(() => invoices.id)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const insertAcceptedTokenSchema = createInsertSchema(acceptedTokens, {
  id: (schema) => schema.id.uuid(),
  createdAt: () => z.coerce.date().default(new Date()),
}).omit({ id: true });

export const selectAcceptedTokenSchema = createSelectSchema(acceptedTokens, {
  createdAt: () => z.coerce.date().default(new Date()),
});

export const acceptedTokensRelations = relations(acceptedTokens, ({ one }) => ({
  invoice: one(invoices, {
    fields: [acceptedTokens.invoiceId],
    references: [invoices.id],
  }),
}));
