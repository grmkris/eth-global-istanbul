import { cn } from "@/components/utils.ts";
import { useAccountAbstraction } from "@/features/aa/accountAbstractionContext.tsx";
import { Outlet, useRouter } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Address, formatUnits } from "viem";
import { getWalletBalance, usdcContractAddress } from "@/features/balance-check.ts";

function toUppercaseFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const Layout = () => {
  const router = useRouter();

  // const { ownerAddress } = useAccountAbstraction();
  // console.log("router", router.route.pathname)

  if ( router.state.location.pathname === "/" || router.state.location.pathname.includes("/invoice/") || router.state.location.pathname.includes("/invoice-paid/")) {
    return <Outlet/>;
  }

  return (
      <div>
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div
              className="border-success-400 bg-primary-900 flex grow flex-col gap-y-5 overflow-y-auto border-r px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img
                  className=""
                  height={ 38 }
                  width={ 38 }
                  src="/icons/eth-logo.svg"
                  alt=""
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    { ["invoices", "payments"].map((item) => (
                        <li key={ item }>
                          <a // TODO start using router and link
                              href={ `/${ item }` }
                              className={ cn(
                                  `hover:border-success-400 border-primary-900 border transition-all duration-300 ease-in-out hover:text-opacity-5 ${router.state.location.pathname === `/${item}` ? "bg-gray-800" : ""}`,
                                  "text-success-400 group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                              ) }
                          >
                            { toUppercaseFirst(item) }
                          </a>
                        </li>
                    )) }
                  </ul>
                </li>
                <li className="mt-auto">
                  <a
                      href="#"
                      className="hover:bg-primary-900 group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:text-gray-400"
                  >
                    <img width="30" height="30" src="/icons/glasses.svg" alt="" />
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mx-6 py-6 pl-72">
          <WalletInfoBanner/>
          <main className="py-10">
            <Outlet/>
          </main>
        </div>
      </div>
  );
};

const WalletInfoBanner = () => {
  const { ownerAddress, safeSelected } = useAccountAbstraction();

  const balance = useGetBalance({
    wallet: safeSelected,
    token: usdcContractAddress
  })
  return (
      <div className="flex flex-col gap-4 p-6 border-success-400 bg-primary-900 rounded-xl border shadow-sm w-full">
        <div className="flex ">
          <h1 className="w-1/12 text-lg font-bold text-success-400">Your safe: </h1>
          <h1 className="flex-1 text-lg font-bold text-success-400">{ safeSelected }</h1>
        </div>
        <div className="flex ">
          <p className="w-1/12 text-lg font-bold text-success-400">Owner:</p>
          <p className="flex-1 text-lg font-bold text-success-400">{ ownerAddress }</p>
        </div>
        { balance.data ?
            <div className="flex ">
              <p className="w-1/12 text-lg font-bold text-success-400">Balance:</p>
              <p className="flex-1 text-lg font-bold text-success-400">{ formatUnits(BigInt(String(balance.data)), 6) }</p>
            </div>
            : null }
      </div>
  );
};


export const useGetBalance = (props: {
  wallet?: string;
  token: Address;
}) => {
  const balance = useQuery({
    enabled: !!props.wallet,
    queryKey: ["balance", props.wallet],
    queryFn: async () => {
      if ( !props.wallet ) throw new Error("No safe selected");
      const res = getWalletBalance({
        wallet: props.wallet,
        erc20: props.token
      });
      return res;
    },
    refetchInterval: 5000,
  });

  return balance;
}
