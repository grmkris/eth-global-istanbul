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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./index.css";

import { generateAppConfig } from "@/AppConfig.ts";
import { AccountAbstractionProvider } from "@/features/aa/accountAbstractionContext.tsx";
import { Landing } from "@/features/Landing.tsx";
import { Invoice } from "@/features/Invoice.tsx";
import { trpcClient } from "@/features/trpc-client.ts";
import { selectInvoiceSchema } from "backend/src/db/schema.ts";
import { InvoiceDetails } from "@/features/InvoiceDetails.tsx";
import { InvoicePaid } from "@/features/invoice-paid.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

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
    if (invoice.isLoading || !invoice.data) return <div className="bg-primary-900"><Skeleton className="w-full mt-5"/></div>;
    return <Invoice invoice={selectInvoiceSchema.parse(invoice.data)} />;
  },
});

// invoice details page
const invoiceDetailsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/invoice-details/$invoiceId",
  component: ({ useParams }) => {
    const invoice = trpcClient["invoices"].get.useQuery(useParams().invoiceId);
    if (invoice.isLoading || !invoice.data) return <div className="bg-primary-900"><Skeleton className="w-full mb-5"/></div>;
    return <InvoiceDetails invoice={selectInvoiceSchema.parse(invoice.data)} />;
  },
});

// invoice paid page
const invoicePaidRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/invoice-paid/$invoiceId",
  component: ({ useParams }) => {
    const invoice = trpcClient["invoices"].get.useQuery(useParams().invoiceId);
    if (invoice.isLoading || !invoice.data) return <div className="bg-primary-900"><Skeleton className="w-full mb-5"/></div>;
    return <InvoicePaid invoice={selectInvoiceSchema.parse(invoice.data)} />;
  },
});

// Create the route tree using your root and dynamically generated entity routes
const routeTree = rootRoute.addChildren([
  indexRootRoute,
  invoiceDetailsRoute,
  paymentRoute,
  invoicePaidRoute,
  ...generateAppConfig({ rootRoute }),
]);

// Create the router using your route tree
const router = new Router({ routeTree });


ReactDOM.createRoot(document.getElementById("root")!).render(

  <StrictMode>
    <TrpcProvider>
      <AccountAbstractionProvider>
        <>
          <RouterProvider router={router} />
          <ToastContainer toastStyle={{ backgroundColor: "#323236" }} />
        </>
      </AccountAbstractionProvider>
    </TrpcProvider>
  </StrictMode>,
);
