import { selectInvoiceSchema } from "backend/src/db/invoices.ts";
import { QRCode } from 'react-qrcode-logo';
import {Address, formatUnits} from 'viem'
import {useQuery} from "@tanstack/react-query";
import {ENABLED_TOKENS_GOERLI, getWalletBalance} from "@/features/balance-check.ts";
import {useAccount} from "wagmi";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft} from "lucide-react";
import {useRouter} from "@tanstack/react-router";

function ConnectButton() {
    return <w3m-button />
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
    const router = useRouter();

  const list = [
    {name: "ID", value: props.invoice.id},
    {name: "Description", value: props.invoice.description},
    {name: "Payer Email", value: props.invoice?.payerEmail ?? ""},
    {name: "Payer Name", value: props.invoice?.payerName ?? ""},
    {name: "Payer Wallet", value: props.invoice?.payerWallet ?? ""},
    {name: "Amount", value: props.invoice?.amountDue + " " +  props.invoice.currency ?? 0},
    {name: "Wallet", value: props.invoice.wallet},
    {name: "Status", value: props.invoice.status},
    {name: "Due date", value: props.invoice?.dueDate?.toLocaleString() ?? ""},
  ]

  return (
      <>
          <Button
              variant="dark"
              className="text-success-400 gap-2 ml-2 mt-3"
              onClick={() =>router.navigate({to: `/invoices`})}
          >
              <ArrowLeft />
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
      </>
  );
};
