import { selectInvoiceSchema } from "backend/src/db/invoices.ts";
import { QRCode } from 'react-qrcode-logo';
import {Address, formatUnits} from 'viem'
import {useQuery} from "@tanstack/react-query";
import {ENABLED_TOKENS_GOERLI, getWalletBalance} from "@/features/balance-check.ts";
import {useAccount} from "wagmi";

function ConnectButton() {
    return <w3m-button />
}

export const Invoice = (props: { invoice: selectInvoiceSchema }) => {
  console.log(props.invoice);

  const Item = (props: {title: string, value: string | number, key: string | number}) => {
    return (
        <div className="flex items-center">
          <h6 className="text-success-400 text-base min-w-[110px]">{props.title}:</h6>
          <p className="text-base text-success-400 font-bold">{props.value}</p>
        </div>
    )
  }

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
      <div className="max-w-xl p-6 rounded-xl mx-auto mt-20 bg-black  border-success-400">
          <div className="flex justify-center mb-8">
            <QRCode
                size={300}
                bgColor="bg-primary-900"
                fgColor="#9dfc7c"
                qrStyle="dots"
                eyeRadius={50}
                value={`https://metamask.app.link/send/${props.invoice.payerWallet}@05/transfer?address=${props.invoice.wallet}&uint256=${formatUnits(BigInt(props.invoice.amountDue), 6)}`} />
          </div>
        <>
          {list.map(i => {
            return <Item key={Math.random()} title={i.name} value={i.value} />
          })}
        </>
          <div className="flex justify-center mt-8">
              <Web3Connect/>
              </div>
      </div>
  );
};

export const Web3Connect = () => {
    const account = useAccount()
    const balances = useGetBalances({address: account.address});

    console.log(balances.data);
    return (
        <ConnectButton/>
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
                const balance = await getWalletBalance({wallet: props.address, erc20: token.address});
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
