import { selectInvoiceSchema } from "backend/src/db/invoices.ts";

export const InvoicePaid = (props: {
  invoice: selectInvoiceSchema
}) => {
  return (
      <>
        <div className="w-full rounded-xl mx-auto border border-success-400">
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
                                                               href={ `/invoice-details/${ props.invoice.id }` }>{ props.invoice.id }</a> has
              been paid</p>
            <button
                className="duration-500 ease-in-out inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-success-400 bg-primary-900 hover:opacity-60 h-10 px-4 py-2 mb-4 ml-4 text-success-400">

              <a href="/invoices"><span className="text-sm font-medium">
                  Invoices
                </span>
              </a>
            </button>
          </div>
        </div>
      </>
  );
};
