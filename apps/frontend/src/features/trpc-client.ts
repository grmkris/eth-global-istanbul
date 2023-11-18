import { httpBatchLink } from "@trpc/client";
import { createTRPCProxyClient, createTRPCReact } from "@trpc/react-query";
import { ElysiaRouter } from "backend/src/router.ts";

export const trpcClient = createTRPCReact<ElysiaRouter>();
export const trpc = createTRPCProxyClient<ElysiaRouter>({
  links: [
    httpBatchLink({
      url: "https://api.blabla.pink/trpc",
    }),
  ],
});
