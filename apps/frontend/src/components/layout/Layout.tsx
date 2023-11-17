import { cn } from "@/components/utils.ts";
import { useAccountAbstraction } from "@/features/aa/accountAbstractionContext.tsx";
import { Outlet, useRouter } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {Address, createPublicClient, formatUnits, http} from "viem";
import erc20ABI from "backend/src/payment-checker/erc20Abi.json";
import {goerli} from "viem/chains";

function toUppercaseFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export const Layout = () => {
  const router = useRouter();
  // const { ownerAddress } = useAccountAbstraction();

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

        <div className="mx-4 py-6 pl-72">
          <WalletInfoBanner />
          <main className="py-10">
            <Outlet />
          </main>
        </div>
      </div>
  );
};

const WalletInfoBanner = () => {
  const { ownerAddress, safeSelected, safeBalance } = useAccountAbstraction();

  const balance = useQuery({
    enabled: !!safeSelected,
    queryKey: ["balance", safeSelected],
    queryFn: async () => {
      if (!safeSelected) throw new Error("No safe selected");
      const res = getWalletBalance({
        wallet: safeSelected,
        erc20: usdcContractAddress
      });
      return res;
    },
    refetchInterval: 5000,
  });

  return (
      <div className="flex flex-col gap-4 p-6 border-success-400 bg-primary-900 rounded-xl border shadow-sm w-full">
        <h1 className="text-lg font-bold text-success-400">Your safe: {safeSelected} </h1>
        <p className="text-sm font-bold text-success-400">Owner: {ownerAddress}</p>
        {balance.data ? <p className="text-sm font-bold text-success-400">Balance: {formatUnits(BigInt(String(balance.data)), 6)}</p> : null}
      </div>
  );
};


export const viemPublic = createPublicClient({
  chain: goerli,
  transport: http()
})



export const getWalletBalance = async (props: {
  wallet: string, erc20: Address
}) => {

  const balance = await viemPublic.readContract({
    address: props.erc20,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [props.wallet]
  })
  return balance
}

export const usdcContractAddress = '0x30A01fe57Fe433D17DD168EAF80Bd91f2719f7D9' // GOERLI https://faucet.allianceblock.io/
