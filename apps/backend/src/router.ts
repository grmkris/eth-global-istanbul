import { z } from "zod";

import { db } from "./db/db";
import {
  insertInvoiceSchema,
  insertPaymentSchema,
  invoices,
  payments,
  selectInvoiceSchema,
  selectPaymentSchema,
} from "./db/schema";
import { createRouterFactory } from "./genericRouter";
import { publicProcedure, router } from "./trpc";

export const elysiaRouter = router({
  hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
    return `Hello ${input ?? "World"}! from Elysia 🦊`;
  }),
  invoices: createRouterFactory({
    id: "invoices",
    selectSchema: selectInvoiceSchema,
    updateSchema: selectInvoiceSchema.partial().extend({ id: z.string() }),
    insertSchema: insertInvoiceSchema,
    table: invoices,
    db: db,
  }),
  payments: createRouterFactory({
    id: "payments",
    selectSchema: selectPaymentSchema,
    updateSchema: selectPaymentSchema.partial().extend({ id: z.string() }),
    insertSchema: insertPaymentSchema,
    table: payments,
    db: db,
  }),
});

export type ElysiaRouter = typeof elysiaRouter;
