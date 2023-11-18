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
import {createHmac} from "crypto"

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
  onrampConfig: publicProcedure.query(async () => {
    console.log("onrampConfig1 generateSignature");
    let secretkey = "EtCjeTWWVRVICQpiBrVSUsZPtdTahQku";
    let dataVerify = "GET" + "/onramp/v1/configuration";

    const hmac = createHmac('sha256', secretkey);
    hmac.update(dataVerify);
    const signature = hmac.digest('hex');

    console.log("onrampConfig2 signature", signature);
    // Expected output: e09cb7d69cef805a0f3092c770df60f2e1e91fb3ebdedc8f85f713a7369ba0e5

    const config = await fetch("https://api-sandbox.gatefi.com/onramp/v1/configuration", {
          headers: {
            'api-key': "fRSklEGUlvcQlYvQBjByLVAqytdbhvHj",
            'signature': signature
          }
        }
    )

    const result = await config.json();

    console.log("onrampConfig3 config", result);


    return result;
  })
});

export type ElysiaRouter = typeof elysiaRouter;
