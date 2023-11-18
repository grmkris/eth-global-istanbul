import { selectInvoiceSchema } from "backend/src/db/invoices.ts";
import {Web3Inbox} from "@/features/web3Inbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import { CornerUpLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export const InvoicePaid = (props: {

  invoice: selectInvoiceSchema
}) => {
  const router = useRouter()

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
        <div className="min-w-1/2 max-w-7xl  rounded-xl mx-auto border border-success-400 mt-36">
          <div className="flex flex-col items-center space-y-2 justify-center p-4 gap-3">
              <img width={200} height={200} className="rounded-full" src={`https://noun.pics/${Math.floor(Math.random() * (1000 - 1 + 1) + 1)}.jpg`} alt=""/>

            <h1 className="text-4xl text-success-400">Thank You!</h1>
            <p className="text-md text-success-400">Invoice <a className="underline"
                                                               href={ `/invoice/${ props.invoice.id }` }>{ props.invoice.id }</a> has
              been paid</p>
            <Web3Inbox invoiceId={ props.invoice.id }/>
          </div>
        </div>
      </>
  );
};
