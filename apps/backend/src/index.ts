import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { trpc } from "@elysiajs/trpc";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Elysia } from "elysia";
import { renderTrpcPanel } from "trpc-panel";

import { db } from "./db/db";
import { elysiaRouter } from "./router";
import cron from "@elysiajs/cron";
import {checkInvoices} from "./payment-checker/paymentChecker";

const app = new Elysia()
  .use(cors({ origin: "localhost:5173" }))
  .use(trpc(elysiaRouter))
  .use(html())
  .get("/trpc-panel", () => {
    return renderTrpcPanel(elysiaRouter, {
      url: `http://localhost:8080/trpc`,
    });
  })
  .onStart(async () => {
    migrate(db, { migrationsFolder: "./drizzle" });
  })
    .use(
    cron({
    name: 'heartbeat',
    pattern: '*/20 * * * * *',
            run() {
         checkInvoices()
    }
        }
    ))
  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

console.log(`TRPC panel is running at http://localhost:8080/trpc-panel`);
