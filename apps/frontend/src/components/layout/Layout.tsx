import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/components/utils.ts";
import { useAccountAbstraction } from "@/features/aa/accountAbstractionContext.tsx";
import { Outlet, useRouter } from "@tanstack/react-router";
import { FolderOpenIcon, SettingsIcon } from "lucide-react";

function toUppercaseFirst(str: String) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export const Layout = () => {
  const router = useRouter();
  const { ownerAddress } = useAccountAbstraction();

  if (router.state.location.pathname === "/landing") {
    return <Outlet />;
  }

  if (router.state.location.pathname.endsWith("/pay")) {
    return <Outlet />;
  }

  return (
    <div>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="border-success-400 bg-primary-900 flex grow flex-col gap-y-5 overflow-y-auto border-r px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className=""
              height={38}
              width={38}
              src="/icons/eth-logo.svg"
              alt=""
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {["invoices", "payments", "selected_tokens"].map((item) => (
                    <li key={item}>
                      <a // TODO start using router and link
                        href={`/${item}`}
                        className={cn(
                          "hover:border-success-400 border-primary-900 border transition-all duration-300 ease-in-out hover:text-opacity-5",
                          "text-success-400 group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                        )}
                      >
                        {toUppercaseFirst(item)}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <a
                  href="#"
                  className="hover:bg-primary-900 group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:text-gray-400"
                >
                  <SettingsIcon
                    className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-400"
                    aria-hidden="true"
                  />
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="mx-2 py-6 pl-72">
        <div className="border-success-400 bg-primary-900 sticky top-0 z-40 mx-2 flex h-16 shrink-0 items-center gap-x-4 rounded-xl border px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <FolderOpenIcon className="h-6 w-6" aria-hidden="true" />
          </Button>

          <WalletInfoBanner />
        </div>
        <main className="py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const WalletInfoBanner = () => {
  const { ownerAddress, safeSelected, safeBalance } = useAccountAbstraction();
  return (
    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 ">
      <div>
        <h1 className="text-lg font-bold">Your safe: {safeSelected} </h1>
        <p>Owner: {ownerAddress}</p>
      </div>
      <div className="text-right">
        <p>Balance: {safeBalance}</p>
      </div>
      <button
        id="createWallet"
        className="rounded-full bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
      >
        +
      </button>
    </div>
  );
};
