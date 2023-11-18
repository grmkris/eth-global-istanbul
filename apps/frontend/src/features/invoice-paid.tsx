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
            <div className=" border-2 border-success-400 rounded-full w-44 h-44 flex items-center justify-center">
              <svg className="w-12 h-12 text-success-400 dark:text-white" aria-hidden="true"
                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                      d="M1 5.917 5.724 10.5 15 1.5"/>
              </svg>
            </div>

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
