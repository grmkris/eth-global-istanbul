import { selectInvoiceSchema } from "backend/src/db/invoices.ts";
import { QRCode } from 'react-qrcode-logo';
import { Address, formatUnits} from 'viem'
import { useQuery } from "@tanstack/react-query";
import { ENABLED_TOKENS_GOERLI, getWalletBalance } from "@/features/balance-check.ts";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button.tsx";
import { CornerUpLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox.tsx";

function ConnectButton() {
    return <w3m-button/>
}

export const Item = (props: {title: string, value: string | number, key: string | number, className?: string}) => {
    return (
        <div className={`flex items-center ${props.className}`}>
            <h6 className="text-success-400 text-base min-w-[110px]">{props.title}:</h6>
            <p className="text-base text-success-400 font-bold">{props.value}</p>
        </div>
    )
}

export const Invoice = (props: { invoice: selectInvoiceSchema }) => {
    console.log(props.invoice);
    const router = useRouter()

    const list = [
        {name: "ID", value: props.invoice.id},
        {name: "Description", value: props.invoice.description},
        {name: "Payer Email", value: props.invoice?.payerEmail ?? ""},
        {name: "Payer Name", value: props.invoice?.payerName ?? ""},
        {name: "Payer Wallet", value: props.invoice?.payerWallet ?? ""},
        {name: "Amount", value: props.invoice?.amountDue ?? 0},
        {name: "Currency", value: props.invoice.currency ?? ""},
        {name: "Wallet", value: props.invoice.wallet},
        {name: "Status", value: props.invoice.status},
        {name: "Due date", value: props.invoice?.dueDate?.toLocaleString() ?? ""},
    ]
    return (
        <>
            <Button
                variant="dark"
                className="text-success-400 gap-3 mt-3 ml-2"
                onClick={() => router.navigate({to: `/invoices`})}
            >
                <CornerUpLeft size="16" />
                Go Back
            </Button>
            <div className="max-w-xl p-6 rounded-xl mx-auto mt-20 bg-black  border-success-400">
                <div className="flex justify-center mb-8">
                    <QRCode
                        size={300}
                        bgColor="bg-primary-900"
                        fgColor="#9dfc7c"
                        qrStyle="dots"
                        eyeRadius={50}
                        value={`https://metamask.app.link/send/${props.invoice.payerWallet}@05/transfer?address=${props.invoice.wallet}&uint256=${formatUnits(BigInt(props.invoice.amountDue), 6)}`}/>
                </div>
                <>
                    {list.map(i => {
                        return <Item key={Math.random()} title={i.name} value={i.value}/>
                    })}
                </>
                <div className="flex mt-8">
                    <Web3Connect/>
                </div>
            </div>
        </>

    );
};

export const Web3Connect = () => {
  const account = useAccount()
  const balances = useGetBalances({address: account.address});

  console.log("balances.data", balances.data);

  return (
    <div>
      <ConnectButton/>
      <div className="flex flex-col gap-6 mt-5 w-full">
        {balances.data?.map(i => {
          return (
            <div className="flex items-center gap-3" key={i?.token.name}>
              <Checkbox />
              <div className="relative">
                  <img height={30} width={30} src="/images/goerli-logo.png" alt="" className="rounded-xl"/>
                  <img width={18} height={18} className="absolute rounded-full z-10 -bottom-2 -right-2" src={i?.token.icon} alt=""/>
              </div>
              <p className="text-success-400">{i?.token.name}</p>
              <p className="text-success-400">{Number(formatUnits(BigInt(i?.balance), i?.token.name === "USDC" ? 6 : 18)).toLocaleString()}</p>
            </div>
          )
        })}
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
            console.log("data", data)

            // filter out empty balances
            return data.filter(balance => balance?.balance !== BigInt(0));
            // return data;
        },
    });
}