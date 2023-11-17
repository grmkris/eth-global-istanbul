import { selectInvoiceSchema } from "backend/src/db/invoices.ts";

export const Payment = (props: { invoice: selectInvoiceSchema }) => {
  console.log(props.invoice);
  return <div className="h-screen bg-background"></div>;
};
