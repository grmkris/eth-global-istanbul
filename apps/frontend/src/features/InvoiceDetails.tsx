import {selectInvoiceSchema} from "backend/src/db/invoices.ts";
import {Item} from "@/features/Invoice.tsx";

export const InvoiceDetails = (props: { invoice: selectInvoiceSchema }) => {
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
      <div className="p-6 rounded-xl border border-success-400">
          <>
              {list.map(i => {
                  return <Item className="gap-20" key={Math.random()} title={i.name} value={i.value} />
              })}
          </>
      </div>
  )
}