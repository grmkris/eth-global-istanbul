import { selectInvoiceSchema } from "backend/src/db/invoices.ts";
import { QRCode } from 'react-qrcode-logo';
import { Address, formatUnits } from 'viem'
import { useQuery } from "@tanstack/react-query";
import { ENABLED_TOKENS_GOERLI, getWalletBalance } from "@/features/balance-check.ts";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button.tsx";
import {Copy, CornerUpLeft} from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useEffect, useRef, useState } from "react";
import { GateFiSDK, GateFiDisplayModeEnum } from "@gatefi/js-sdk";
import { trpcClient } from "@/features/trpc-client.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";

function ConnectButton() {
  return <w3m-button/>
}


export const Item = (props: { title: string, value: string | number, key: string | number, className?: string }) => {
  return (
      <div className={ `flex items-center ${ props.className }` }>
        <h6 className="text-success-400 text-base min-w-[110px]">{ props.title }:</h6>
        <p className="text-base text-success-400 font-bold">{ props.value }</p>
      </div>
  )
}

export const Invoice = (props: { invoice: selectInvoiceSchema }) => {
  console.log(props.invoice);
  const router = useRouter()

  const signature = trpcClient.onrampConfig.useQuery()

  console.log(signature.data);

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

  useEffect(() => {
    return () => {
      overlayInstanceSDK.current?.destroy();
      overlayInstanceSDK.current = null;
    };
  }, []);

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
              className="fixed left-1/2 -translate-x-1/2 max-h-[90vh] max-w-xl p-6 rounded-xl bg-black border-success-400 overflow-auto">
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
                            onClick={async () => await navigator.clipboard.writeText(props.invoice.wallet)}/>
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
              <div className="flex items-start justify-between mt-8">
                  <Web3Connect/>
                  <Button variant="dark" className="text-success-400 bg-base-black" onClick={() => handleOnClick()}>
                      Fiat Button
                  </Button>
              </div>
          </div>
      </>

  );
};

export const Web3Connect = () => {
    const account = useAccount()
    const balances = useGetBalances({address: account.address});
    console.log("000", balances.data);

    return (
        <div>
            <ConnectButton/>
            <div className="flex flex-col gap-6 mt-5 w-full">
                {balances.data?.map(i => {
                    return (
                        <div className="flex items-center gap-3" key={i?.token.name}>
                        <Checkbox/>
                  <div className="relative">
                    <img height={ 30 } width={ 30 } src="/images/goerli-logo.png" alt="" className="rounded-xl"/>
                    <img width={ 18 } height={ 18 } className="absolute rounded-full z-10 -bottom-2 -right-2"
                         src={ i?.token.icon } alt=""/>
                  </div>
                  <p className="text-success-400">{ i?.token.name }</p>
                  <p className="text-success-400">{ Number(formatUnits(BigInt(i?.balance), i?.token.name === "USDC" ? 6 : 18)).toLocaleString() }</p>
                </div>
            )
          }) }
        </div>
      </div>
  )
}


export const useGetBalances = (props: {
  address?: Address;
}) => {
  return useQuery({
    enabled: !!props.address,
    queryKey: ["balances", props.address, ENABLED_TOKENS_GOERLI],
    queryFn: async () => {
      if ( !props.address ) return;
      const balances = ENABLED_TOKENS_GOERLI.map(async (token) => {
        if ( !props.address ) return;
        const balance = await getWalletBalance({ wallet: props.address, erc20: token.address as Address });
        console.log(balance);
        return {
          token,
          balance
        }
      })

      // await Promise.all(balances);
      const data = await Promise.all(balances);

      // filter out empty balances
      return data.filter(balance => balance?.balance !== BigInt(0));
    },
  });
}
