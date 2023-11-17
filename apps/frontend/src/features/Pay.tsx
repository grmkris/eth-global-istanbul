import { selectInvoiceSchema } from "backend/src/db/invoices.ts";

export const Payment = (props: { invoice: selectInvoiceSchema }) => {
  console.log(props.invoice);
  const Item = (props: {title: string, value: string | number}) => {
    return (
        <div className="flex items-center">
          <h6 className="text-success-400 text-base min-w-[150px]">{props.title}:</h6>
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
    {name: "Created at", value: props.invoice?.createdAt?.toLocaleString() ?? ""},
    {name: "Updated at", value: props.invoice?.updatedAt?.toLocaleString() ?? ""},
    {name: "Due date", value: props.invoice?.dueDate?.toLocaleString() ?? ""},
  ]
  return (
      <div className="border border-success-400 p-6 rounded-xl flex flex-col gap-y-4">
        <>
          {list.map(i => {
            return <Item title={i.name} value={i.value} />
          })}
        </>
      </div>
  );
};
