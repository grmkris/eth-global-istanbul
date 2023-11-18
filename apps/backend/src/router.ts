import {z} from "zod";

import {db} from "./db/db";
import {
  insertInvoiceSchema,
  insertPaymentSchema,
  invoices,
  payments,
  selectInvoiceSchema,
  selectPaymentSchema,
} from "./db/schema";
import {createRouterFactory} from "./genericRouter";
import {publicProcedure, router} from "./trpc";
import {createHmac} from "crypto"
import {eq} from "drizzle-orm";

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
  markInvoiceHandled: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const handled = await db.update(invoices).set({
        status: 'handled'
      }).where(eq(invoices.id, input)).returning().execute();

      const response = await fetch(
          'https://notify.walletconnect.com/b769195d525fcd74f9ac88723ad1b8c5/notify', // TODO move this to env
          {
            method: "POST",
            headers: {
              Authorization: 'Bearer b0ee6482-b4df-48eb-93ed-9d584c241a99',
            "Content-Type": 'application/json'
            },
            body: JSON.stringify({
              notification: {
                type: "6b68cf7f-d7f8-46f3-bfa0-822cb613eef6", // Notification type ID copied from Cloud
                title: "Your invoice has been handled",
                body: "Thank you, come again",
                orderId: input,
                icon: "https://app.example.com/icon.png", // optional
                url: `http://localhost:5173/invoice/${input}`, // optional
              },
              accounts: [
                `eip155:1:${handled[0].payerWallet}`
              ]
            })
          }
      );

      console.log("markInvoiceHandled", {handled, response});

      return handled;
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
