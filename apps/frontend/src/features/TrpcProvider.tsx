import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";

import { trpcClient } from "./trpc-client.ts";

export const queryClient = new QueryClient();

export function TrpcProvider(props: { children?: React.ReactNode }) {
  const [combinedClient] = useState(() => {
    return trpcClient.createClient({
      links: [httpBatchLink({ url: "http://localhost:8080/trpc" })],
    });
  });

  return (
    <trpcClient.Provider client={combinedClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpcClient.Provider>
  );
}
