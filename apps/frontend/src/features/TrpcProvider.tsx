import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";

import { trpcClient } from "./trpc-client.ts";
import {goerli} from "viem/chains";
import {configureChains, WagmiConfig} from "wagmi";
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { walletConnectProvider, EIP6963Connector } from '@web3modal/wagmi'

import {  createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
export const queryClient = new QueryClient();


// 1. Get projectId
const projectId = 'c1db98c2e91101f3d56eda4168c3c5d4'

// 2. Create wagmiConfig
const { chains, publicClient } = configureChains(
    [goerli],
    [walletConnectProvider({ projectId }), publicProvider()]
)

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }),
    new EIP6963Connector({ chains }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({ chains, options: { appName: metadata.name } })
  ],
  publicClient
})

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

export function TrpcProvider(props: { children?: React.ReactNode }) {
  const [combinedClient] = useState(() => {
    return trpcClient.createClient({
      links: [httpBatchLink({ url: "https://back-production-2099.up.railway.app/trpc" })],
    });
  });

  return (
    <trpcClient.Provider client={combinedClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
        {props.children}
        <ReactQueryDevtools initialIsOpen={false} />
        </WagmiConfig>
      </QueryClientProvider>
    </trpcClient.Provider>
  );
}
