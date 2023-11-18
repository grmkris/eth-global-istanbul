import { StrictMode } from "react";
import { Layout } from "@/components/layout/Layout.tsx";
import { TrpcProvider } from "@/features/TrpcProvider";
import {
  RootRoute,
  Route,
  Router,
  RouterProvider,
} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import "./index.css";

import { generateAppConfig } from "@/AppConfig.ts";
import { AccountAbstractionProvider } from "@/features/aa/accountAbstractionContext.tsx";
import { Landing } from "@/features/Landing.tsx";
import { Invoice } from "@/features/Invoice.tsx";
import { trpcClient } from "@/features/trpc-client.ts";
import { selectInvoiceSchema } from "backend/src/db/schema.ts";
import {InvoiceDetails} from "@/features/InvoiceDetails.tsx";


// Create a root route
export const rootRoute = new RootRoute({ component: Layout });

const indexRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    return <Landing />;
  },
});

// payment page
const paymentRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/invoice/$invoiceId",
  component: ({ useParams }) => {
    const invoice = trpcClient["invoices"].get.useQuery(useParams().invoiceId);
    if (invoice.isLoading || !invoice.data) return <div className="bg-primary-900">Loading...</div>;
    return <Invoice invoice={selectInvoiceSchema.parse(invoice.data)} />;
  },
});

// payment page
const invoiceDetailsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/invoice-details/$invoiceId",
  component: ({ useParams }) => {
    const invoice = trpcClient["invoices"].get.useQuery(useParams().invoiceId);
    if (invoice.isLoading || !invoice.data) return <div className="bg-primary-900">Loading...</div>;
    return <InvoiceDetails invoice={selectInvoiceSchema.parse(invoice.data)} />;
  },
});

// Create the route tree using your root and dynamically generated entity routes
const routeTree = rootRoute.addChildren([
  indexRootRoute,
  invoiceDetailsRoute,
  paymentRoute,
  ...generateAppConfig({ rootRoute }),
]);

// Create the router using your route tree
const router = new Router({ routeTree });


ReactDOM.createRoot(document.getElementById("root")!).render(

  <StrictMode>
    <TrpcProvider>
      <AccountAbstractionProvider>
        <RouterProvider router={router} />
      </AccountAbstractionProvider>
    </TrpcProvider>
  </StrictMode>,
);
