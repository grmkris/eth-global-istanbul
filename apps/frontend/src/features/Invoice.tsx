import {selectInvoiceSchema} from "backend/src/db/invoices.ts";
import {QRCode} from 'react-qrcode-logo';
import {Address, formatUnits, parseUnits} from 'viem'
import {useQuery} from "@tanstack/react-query";
import {ENABLED_TOKENS_GOERLI, getWalletBalance} from "@/features/balance-check.ts";
import {useAccount, useContractWrite, usePrepareContractWrite, useWalletClient, WalletClient} from "wagmi";
import {Button} from "@/components/ui/button.tsx";
import {Copy, CornerUpLeft} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import React, {useEffect, useRef, useState} from "react";
import {GateFiDisplayModeEnum, GateFiSDK} from "@gatefi/js-sdk";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {MetadataApi, stringifyDeterministic} from '@cowprotocol/app-data'
// Sorry, it's a magic, we should import it to make MetadataApi work
import {
    OrderBookApi,
    OrderClass,
    OrderCreation,
    OrderKind,
    OrderQuoteRequest,
    OrderQuoteSideKindBuy,
    OrderSigningUtils,
    SigningScheme,
    SupportedChainId,
    UnsignedOrder
} from '@cowprotocol/cow-sdk'
import {Web3Provider} from '@ethersproject/providers'
import erc20ABI from "backend/src/payment-checker/erc20Abi.json";
import {useRouter} from "@tanstack/react-router";
import {Web3Inbox} from "@/features/web3Inbox.tsx";
import {toast} from "react-toastify";
import { ethers, Contract } from 'ethers';

const chainId = SupportedChainId.GOERLI


export function walletClientToSigner(walletClient: WalletClient) {
    const { account, chain, transport } = walletClient
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    }
    const provider = new Web3Provider(transport, network)
    return provider.getSigner(account.address)
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
    const { data: walletClient } = useWalletClient({ chainId })
    return React.useMemo(
        () => (walletClient ? walletClientToSigner(walletClient) : undefined),
        [walletClient],
    )
}

export const metadataApi = new MetadataApi()
const appCode = 'LoomPay'
const environment = 'hackathon'
const referrer = { address: `0x40D73aa5cA202c7c751F71E158BdAb30Eab7347D` }

const quote = { slippageBips: '0.5' } // Slippage percent, it's 0 to 100
const orderClass = OrderClass.MARKET  // "market" | "limit" | "liquidity"

function ConnectButton() {
  return <w3m-button/>
}


export const Item = (props: { title: string, value: string | number, key: string | number, className?: string }) => {
  return (
      <div className={ `flex items-center p-2 border-b border-gray-800 ${ props.className }` }>
        <h6 className="text-success-400 text-sm min-w-[110px]">{ props.title }:</h6>
        <p className="text-base text-success-400 font-bold">{ props.value }</p>
      </div>
  )
}

export const Invoice = (props: { invoice: selectInvoiceSchema }) => {
  const router = useRouter()
  const account = useAccount()
  const balances = useGetBalances({address: account.address});
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedToken, setSelectedToken] = useState()
  const signer = useEthersSigner()

    const VAULT_RELAYER = { address: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' };
    // const USDC = new Contract('0x07865c6E87B9F70255377e024ace6630C1Eaa37F', erc20ABI, provider);
    const COW = new Contract('0x91056D4A53E1faa1A84306D4deAEc71085394bC8', erc20ABI, signer?.getProvider());

    const { config } = usePrepareContractWrite({
        address: balances.data?.find(i => i?.token.name === selectedOption)?.token.address as Address,
        abi: erc20ABI,
        functionName: 'transfer',
        args: [props.invoice.wallet, parseUnits(props.invoice.amountDue.toString(), selectedOption === "USDC" ? 6 : 18)  ]
    })
    const { write, isSuccess, isLoading } = useContractWrite(config)


  const list = [
    { name: "Description", value: props.invoice.description },
    { name: "Payer Email", value: props.invoice?.payerEmail ?? "" },
    { name: "Payer Name", value: props.invoice?.payerName ?? "" },
    { name: "Payer Wallet", value: props.invoice?.payerWallet ?? "" },
    { name: "Amount", value: props.invoice?.amountDue ?? 0 },
    { name: "Currency", value: props.invoice.currency ?? "" },
    { name: "Status", value: props.invoice.status },
    { name: "Due date", value: props.invoice?.dueDate?.toLocaleString() ?? "" },
  ]
  const overlayInstanceSDK = useRef<GateFiSDK | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [cowSwapOrder, setCowSwapOrder] = useState<string | undefined>();
  const cowSwapStatus = useCowSwapOrderStatus({orderId: cowSwapOrder});

  useEffect(() => {
    return () => {
      overlayInstanceSDK.current?.destroy();
      overlayInstanceSDK.current = null;
    };
  }, []);

  const handleOnClickCow = async () => {
    if (account.address == null) {
        console.error("no payerWallet set")
        return "no payerWallet set"
    }
    const orderBookApi = new OrderBookApi({ chainId: chainId })

    const permit = {
        owner: account.address,
        spender: VAULT_RELAYER.address,
        value: await COW.totalSupply(),
        nonce: await COW.nonces(account.address),
        deadline: ethers.constants.MaxUint256,
    };
    const permitSignature = ethers.utils.splitSignature(
        await signer._signTypedData(
            {
                name: await COW.name(),
                version: await COW.version(),
                chainId,
                verifyingContract: COW.address,
            },
            {
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
            },
            permit,
        ),
    );

    const permitParams = [
        permit.owner,
        permit.spender,
        permit.value,
        permit.deadline,
        permitSignature.v,
        permitSignature.r,
        permitSignature.s,
    ];
    const permitHook = {
        target: COW.address,
        callData: COW.interface.encodeFunctionData("permit", permitParams),
        gasLimit: `${await COW.estimateGas.permit(...permitParams)}`,
    };

    const appDataDoc = await metadataApi.generateAppDataDoc({
        appCode,
        environment,
        metadata: {
            referrer,
            quote,
            hooks: {
                pre : [
                    permitHook
                ]
            }
        },
    })

    const { appDataHex } = await metadataApi.appDataToCid(appDataDoc)

    const quoteRequest:OrderQuoteRequest = {
        sellToken: '0x91056D4A53E1faa1A84306D4deAEc71085394bC8', // COW goerli - 18 decimals
        buyToken: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F', // USDC goerli - 6 decimals
        from: account.address,
        receiver: props.invoice.wallet,
        buyAmountAfterFee: (props.invoice.amountDue * 10 ** 6).toString(), // USDC
        kind: OrderQuoteSideKindBuy.BUY,
        appData: await stringifyDeterministic(appDataDoc),
        appDataHash: appDataHex,
    }
    const quoteResponse = await orderBookApi.getQuote(quoteRequest);

    if (quoteRequest.receiver == null) {
        console.log("receiver is null")
        return "receiver is null"
    }
    if (quoteRequest.appDataHash == null) {
        console.log("appDataHash is null")
        return "appDataHash is null"
    }

    const usignedOrder:UnsignedOrder = {
        sellToken: quoteRequest.sellToken,
        buyToken: quoteRequest.buyToken,
        receiver: quoteRequest.receiver,
        appData: quoteRequest.appDataHash,
        kind: OrderKind.BUY,
        validTo: quoteResponse.quote.validTo,
        sellAmount: quoteResponse.quote.sellAmount,
        buyAmount: quoteResponse.quote.buyAmount,
        feeAmount: quoteResponse.quote.feeAmount,
        partiallyFillable: quoteResponse.quote.partiallyFillable,
    }
    const orderSigningResult = await OrderSigningUtils.signOrder(
        usignedOrder,
        chainId,
        signer
    );

    if (quoteRequest.appData == null) {
        console.log("appData is null")
        return "appData is null"
    }

    const orderCreation:OrderCreation = {
        sellToken: quoteRequest.sellToken,
        buyToken: quoteRequest.buyToken,
        kind: OrderKind.BUY,
        signingScheme: SigningScheme.EIP712,
        signature: orderSigningResult.signature,
        appData: quoteRequest.appData,
        appDataHash: quoteRequest.appDataHash,
        from: quoteRequest.from,
        receiver: quoteRequest.receiver,
        sellAmount: quoteResponse.quote.sellAmount,
        buyAmount: quoteResponse.quote.buyAmount,
        validTo: quoteResponse.quote.validTo,
        feeAmount: quoteResponse.quote.feeAmount,
        partiallyFillable: quoteResponse.quote.partiallyFillable,
    }
    const orderId = await orderBookApi.sendOrder(orderCreation);
    const order = await orderBookApi.getOrder(orderId);
    setCowSwapOrder(orderId);
    console.log("Order", JSON.stringify(order, null, 2))
  }

  const handleOnClick = () => {
    if ( overlayInstanceSDK.current ) {
      if ( isOverlayVisible ) {
        overlayInstanceSDK.current.hide();
        setIsOverlayVisible(false);
      } else {
        overlayInstanceSDK.current.show();
        setIsOverlayVisible(true);
      }
    } else {
      overlayInstanceSDK.current = new GateFiSDK({
        merchantId: "b154a828-7274-4949-9643-6a7aa9c8f3b6",
        displayMode: GateFiDisplayModeEnum.Overlay,
        nodeSelector: "#unlimit-overlay",
        isSandbox: true,
        walletAddress: props.invoice.wallet,
        email: props.invoice?.payerEmail ?? "dein@joni.com",
        externalId: props.invoice.id,
        defaultFiat: {
          currency: props.invoice.currency ?? "USD",
          amount: props.invoice?.amountDue.toString() ?? "10",
        },
        defaultCrypto: {
          currency: "USDC"
        },
        availableFiat: [
          "USD",
          "EUR"
        ],
        availableCrypto: [
          "USDC",
          "ETH",
          "USDC_POLYGON"
        ],
        walletLock: true,

      });
    }
    overlayInstanceSDK.current?.show();
    setIsOverlayVisible(true);
  };

    if(!isLoading && isSuccess && props.invoice.status === "paid") {
        router.navigate({to:`/invoice-paid/${props.invoice.id}`})
        toast.success("Invoice has been paid!")
    }

   if (isLoading) {
       toast.info("Transaction is pending!")
   }

  return (
      <>
        <Button
            variant="dark"
            className="text-success-400 gap-3 mt-3 ml-2"
            onClick={ () => router.navigate({ to: `/invoices` }) }
        >
          <CornerUpLeft size="16"/>
          Go Back
        </Button>
          <div
              className="fixed left-1/2 -translate-x-1/2 max-h-[90vh] w-full max-w-2xl p-6 rounded-xl bg-black border-success-400 overflow-auto">
              <div className="flex justify-center mb-2">
                  <QRCode
                      size={300}
                      bgColor="bg-primary-900"
                      fgColor="#9dfc7c"
                      qrStyle="dots"
                      eyeRadius={50}
                      value={`https://metamask.app.link/send/${props.invoice.payerWallet}@05/transfer?address=${props.invoice.wallet}&uint256=${formatUnits(BigInt(props.invoice.amountDue), 6)}`}/>
              </div>
              <div className="text-success-400 mb-5 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                      <p className="text-sm">{props.invoice.wallet}</p>
                      <Copy className="cursor-pointer" size={16}
                            onClick={async () => {
                                await navigator.clipboard.writeText(props.invoice.wallet)
                                toast.success(`"${props.invoice.wallet} is copied!"`)
                            }}/>
                  </div>
                  <div className="text-sm">{props.invoice?.amountDue} {props.invoice.currency}</div>
              </div>
              <>
                  {props.invoice.status === "pending" &&
                      <Skeleton
                          className="w-full mb-5"
                      />
                  }

                  {list.map(i => {
                      return <Item key={Math.random()} title={i.name} value={i.value}/>
                  })}
              </>
              <div className="flex items-start justify-between mt-8 gap-2">
                  <ConnectButton/>
                  <Button variant="dark" id="unlimit-overlay" className="text-success-400 bg-base-black" onClick={() => handleOnClick()}>
                      Fiat Button
                  </Button>
                  <Button variant="dark" className="text-success-400 bg-base-black" disabled={cowSwapStatus.data && cowSwapStatus.data?.status !== 'fulfilled'} onClick={() => handleOnClickCow()}>
                      Cow Button
                  </Button>
                  {props.invoice.status === "pending" && (
                      <Button
                          disabled={selectedOption === '' || isLoading}
                          variant="dark"
                          className="text-primary-900 bg-success-400"
                          onClick={() => write?.()}>
                          Pay
                      </Button>
                  )}
              </div>
              <div>
                  {props.invoice.status === "pending" && (
                      <div className="flex flex-col mt-5 w-full">
                          {balances.data?.map(i => {
                              return (
                                  <div onClick={() => {
                                      setSelectedOption(i?.token.name ?? "")
                                      setSelectedToken(i?.token)
                                  }}
                                       className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 ${selectedOption === i?.token.name ? "bg-gray-700" : ""}`}
                                       key={i?.token.name}>
                                      <Checkbox checked={selectedOption === i?.token.name}
                                                onCheckedChange={() => {
                                                    setSelectedOption(i?.token.name ?? "")
                                                    setSelectedToken(i?.token)
                                                }}/>
                                      <div className="relative">
                                          <img height={30} width={30} src="/images/goerli-logo.png" alt=""
                                               className="rounded-xl"/>
                                          <img width={18} height={18}
                                               className="absolute rounded-full z-10 -bottom-2 -right-2"
                                               src={i?.token.icon} alt=""/>
                                      </div>
                                      <p className="text-success-400">{i?.token.name}</p>
                                      <p className="text-success-400">{Number(formatUnits(BigInt(i?.balance ?? 0), i?.token.name === "USDC" ? 6 : 18)).toLocaleString()}</p>
                                  </div>
                              )
                          })}
                      </div>
                  )}
              </div>
              <div className="flex items-start justify-between mt-8text-success-400">
                  {
                      (props.invoice.status === 'paid' || props.invoice.status === 'handled') && <Web3Inbox orderId={props.invoice.id}/>
                  }
              </div>
          </div>
      </>

  );
};


export const useGetBalances = (props: {
    address?: Address;
}) => {
    return useQuery({
        enabled: !!props.address,
        queryKey: ["balances", props.address, ENABLED_TOKENS_GOERLI],
        queryFn: async () => {
            if (!props.address) return;
            const balances = ENABLED_TOKENS_GOERLI.map(async (token) => {
                if (!props.address) return;
                const balance = await getWalletBalance({wallet: props.address, erc20: token.address as Address});
                return {
                    token,
                    balance
                }
            })

            // await Promise.all(balances);
            const data = await Promise.all(balances);

            // filter out empty balances
            return data.filter(balance => BigInt(balance?.balance ?? 0) !== BigInt(0));
        },
    });
}


const useCowSwapOrderStatus = (props: {
    orderId?: string;
}) => {
    return useQuery({
        enabled: !!props.orderId,
        queryKey: ["order", props.orderId],
        queryFn: async () => {
            if (!props.orderId) return;
            const orderBookApi = new OrderBookApi({ chainId: chainId })
            return await orderBookApi.getOrder(props.orderId);
        },
    });
}
