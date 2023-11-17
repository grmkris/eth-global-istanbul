import { selectInvoiceSchema } from "backend/src/db/invoices.ts";
import { QRCode } from 'react-qrcode-logo';
import { formatUnits } from 'viem'

export const Invoice = (props: { invoice: selectInvoiceSchema }) => {
  console.log(props.invoice);

  const Item = (props: {title: string, value: string | number, key: string | number}) => {
    return (
        <div className="flex items-center">
          <h6 className="text-success-400 text-base min-w-[120px]">{props.title}:</h6>
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
                value={`https://metamask.app.link/send/${props.invoice.payerWallet}/transfer?address=${props.invoice.wallet}=${formatUnits(BigInt(props.invoice.amountDue), 6)}`} />
          </div>
        <>
          {list.map(i => {
            return <Item key={Math.random()} title={i.name} value={i.value} />
          })}
        </>
      </div>
  );
};
