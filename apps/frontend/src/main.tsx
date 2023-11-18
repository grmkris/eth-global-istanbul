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
import { InvoiceDetails } from "@/features/InvoiceDetails.tsx";
import { InvoicePaid } from "@/features/invoice-paid.tsx";


import { SigningScheme, SigningResult, OrderBookApi, OrderQuoteSideKindBuy, OrderSigningUtils, SupportedChainId, OrderParameters, UnsignedOrder, OrderKind, OrderCreation } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { MetadataApi } from '@cowprotocol/app-data'
import { useState, useEffect } from 'react';

// Sorry, it's a magic, we should import it to make MetadataApi work
console.log('Ethers utils', {keccak256, toUtf8Bytes})

declare global {
    interface Window {
        ethereum: any;
    }
}

export const metadataApi = new MetadataApi()
const appCode = 'LoomPay'
const environment = 'hackathon'
const referrer = { address: `0x40D73aa5cA202c7c751F71E158BdAb30Eab7347D` }

const quote = { slippageBips: '0.5' } // Slippage percent, it's 0 to 100
const orderClass = { orderClass: 'market' } // "market" | "limit" | "liquidity"

const account = '0x40D73aa5cA202c7c751F71E158BdAb30Eab7347D'
const chainId = 5 // Goerli
const provider = new Web3Provider(window.ethereum)
const signer = provider.getSigner()

const appDataDoc = await metadataApi.generateAppDataDoc({
    appCode,
    environment,
    metadata: {
        referrer,
        quote,
        orderClass
    },
})

const { cid, appDataHex } = await metadataApi.appDataToCid(appDataDoc)

const quoteRequest = {
    sellToken: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F', // USDC goerli - 6 decimals
    buyToken: '0x91056D4A53E1faa1A84306D4deAEc71085394bC8', // COW goerli - 18 decimals
    from: account,
    receiver: account,
    buyAmountAfterFee: (1 * 10 ** 18).toString(), // 1 COW
    kind: OrderQuoteSideKindBuy.BUY,
    appData: JSON.stringify(appDataDoc),
    // appDataHash: appDataHex,
}

const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.GOERLI })

export const CoWpoc = () => {
    const [quote, setQuote] = useState<OrderParameters | null>(null);
    const [orderSigningResult, setOrderSigningResult] = useState<SigningResult | null>(null);
    const [order, setOrder] = useState<any | null>(null);

    useEffect(() => {
        const fetchQuote = async () => {
            const { quote } = await orderBookApi.getQuote(quoteRequest);
            setQuote(quote);
        };
        fetchQuote();
    }, []);

    const signOrder = async () => {
        if (quote) {
            const usignedOrder:UnsignedOrder = {
                sellToken: quoteRequest.sellToken,
                buyToken: quoteRequest.buyToken,
                receiver: quoteRequest.receiver,
                kind: OrderKind.BUY,
                sellAmount: quote.sellAmount,
                buyAmount: quote.buyAmount,
                validTo: quote.validTo,
                appData: appDataHex,
                feeAmount: quote.feeAmount,
                partiallyFillable: quote.partiallyFillable,
            }
            const orderSigningResult = await OrderSigningUtils.signOrder(
                usignedOrder,
                chainId,
                signer
            );
            setOrderSigningResult(orderSigningResult);
        }
    };

    const sendOrder = async () => {
        if (quote && orderSigningResult) {
            console.log("from", quoteRequest.from)
            console.log("signer", provider.getSigner())
            const orderCreation:OrderCreation = {
                sellToken: quoteRequest.sellToken,
                buyToken: quoteRequest.buyToken,
                sellAmount: quote.sellAmount,
                buyAmount: quote.buyAmount,
                validTo: quote.validTo,
                kind: OrderKind.BUY,
                feeAmount: quote.feeAmount,
                partiallyFillable: quote.partiallyFillable,
                signingScheme: SigningScheme.EIP712,
                signature: orderSigningResult.signature,
                appData: quoteRequest.appData,
                appDataHash: quoteRequest.appDataHash,
                from: quoteRequest.from,
                receiver: quoteRequest.receiver
            }
            console.log("Order", orderCreation)
            const orderId = await orderBookApi.sendOrder(orderCreation);
            console.log("Order ID", orderId)
            const order = await orderBookApi.getOrder(orderId);
            console.log("Order", JSON.stringify(order, null, 2))
            setOrder(order);
        }
    };

    if (!quote) {
        return <div>Loading...</div>;
    }

    return (
        <>
            Hello
            <pre>{JSON.stringify(quote, null, 2)}</pre>
            <pre>{JSON.stringify(orderSigningResult, null, 2)}</pre>
            <pre>{JSON.stringify(order, null, 2)}</pre>
            {orderSigningResult ? (
                <button onClick={() => sendOrder()}>Send Order</button>
            ) : (
                <button onClick={() => signOrder()}>Sign Order</button>
            )}
        </>
    );
}


// Create a root route
export const rootRoute = new RootRoute({ component: Layout });

const indexRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    return <Landing />;
  },
});

// cow poc page route
const CowPocRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/cow-poc",
  component: () => {
    return <CoWpoc />;
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

// invoice paid page
const invoicePaidRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/invoice-paid/$invoiceId",
  component: ({ useParams }) => {
    const invoice = trpcClient["invoices"].get.useQuery(useParams().invoiceId);
    if (invoice.isLoading || !invoice.data) return <div className="bg-primary-900">Loading...</div>;
    return <InvoicePaid invoice={selectInvoiceSchema.parse(invoice.data)} />;
  },
});

// Create the route tree using your root and dynamically generated entity routes
const routeTree = rootRoute.addChildren([
  CowPocRoute,
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
        <RouterProvider router={router} />
      </AccountAbstractionProvider>
    </TrpcProvider>
  </StrictMode>,
);
