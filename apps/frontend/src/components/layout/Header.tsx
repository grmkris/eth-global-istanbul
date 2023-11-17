import { useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useAccountAbstraction } from "@/features/aa/accountAbstractionContext.tsx";
import { useRouter } from "@tanstack/react-router";

export const Header = () => {
  const { loginWeb3Auth, safes, logoutWeb3Auth, safeSelected, ownerAddress } =
    useAccountAbstraction();
  const router = useRouter();

  const handleButtonClick = () => {
    console.log("clicked");
    if (!ownerAddress) {
      loginWeb3Auth();
    } else logoutWeb3Auth();
  };

  // useeffect that checks if user is logged in and then redirects to root page
  useEffect(() => {
    if (ownerAddress) {
      router.navigate({
        to: "/",
      });
    }
  }, [ownerAddress]);

  return (
    <div className="bg-primary-900 border-success-400 flex h-20 items-center justify-between border-b">
      <div className="">
        <img
          className="mb-1 ml-3"
          height={38}
          width={38}
          src="/icons/eth-logo.svg"
          alt=""
        />
      </div>
      <div className="flex items-center gap-3 pr-5">
        <Button onClick={handleButtonClick}>
          {ownerAddress ? "Logout" : "Login"}
        </Button>
      </div>
    </div>
  );
};
