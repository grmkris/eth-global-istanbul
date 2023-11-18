import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Chain, getChain, initialChain } from "@/features/aa/chain.ts";
import AccountAbstraction from "@safe-global/account-abstraction-kit-poc";
import { Web3AuthModalPack } from "@safe-global/auth-kit";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import {
  MetaTransactionData,
  MetaTransactionOptions,
} from "@safe-global/safe-core-sdk-types";
import { useQuery } from "@tanstack/react-query";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { ethers, utils } from "ethers";
import {useLocalStorage} from "usehooks-ts";

type accountAbstractionContextValue = {
  ownerAddress?: string;
  chainId: string;
  safes: string[];
  chain?: Chain;
  isAuthenticated: boolean;
  web3Provider?: ethers.providers.Web3Provider;
  loginWeb3Auth: () => void;
  logoutWeb3Auth: () => void;
  setChainId: (chainId: string) => void;
  safeSelected?: string;
  safeBalance?: string;
  setSafeSelected: React.Dispatch<React.SetStateAction<string | undefined>>;
  isRelayerLoading: boolean;
  relayTransaction: () => Promise<void>;
  gelatoTaskId?: string;
};

const initialState = {
  isAuthenticated: false,
  loginWeb3Auth: () => {},
  logoutWeb3Auth: () => {},
  relayTransaction: async () => {},
  setChainId: () => {},
  setSafeSelected: () => {},
  safes: [],
  chainId: initialChain.id,
  isRelayerLoading: true,
};

const accountAbstractionContext =
  createContext<accountAbstractionContextValue>(initialState);

const useAccountAbstraction = () => {
  const context = useContext(accountAbstractionContext);

  if (!context) {
    throw new Error(
      "useAccountAbstraction should be used within a AccountAbstraction Provider",
    );
  }

  return context;
};

const AccountAbstractionProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  // owner address from the email  (provided by web3Auth)
  const [ownerAddress, setOwnerAddress] = useLocalStorage<string | undefined>("ownerAddress", undefined)

  // safes owned by the user
  const [safes, setSafes] = useState<string[]>([]);

  // chain selected
  const [chainId, setChainId] = useState<string>(() => {
    return initialChain.id;
  });

  // web3 provider to perform signatures
  const [web3Provider, setWeb3Provider] =
    useState<ethers.providers.Web3Provider>();

  const isAuthenticated = !!ownerAddress && !!chainId;
  const chain = getChain(chainId) || initialChain;

  // // reset React state when you switch the chain
  // useEffect(() => {
  //   setOwnerAddress(undefined);
  //   setSafes([]);
  //   setChainId(chain.id);
  //   setWeb3Provider(undefined);
  //   setSafeSelected(undefined);
  // }, [chain]);

  // authClient
  const [web3AuthModalPack, setWeb3AuthModalPack] =
    useState<Web3AuthModalPack>();

  useEffect(() => {
    (async () => {
      const options: Web3AuthOptions = {
        clientId:
          "BBp3RotFeNXkqkpMuZJ1bXkKfTRod-d99VS--8Qd8FghbhkDNvNE1EVq9NqbSv3GpXgMcys4k6LWb2jKPKsnT6I",
        web3AuthNetwork: "testnet",
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: chain.id,
          rpcTarget: chain.rpcUrl,
        },
        uiConfig: {
          theme: "dark",
          loginMethodsOrder: ["google", "facebook"],
        },
      };

      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: "torus",
          showOnModal: false,
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: "metamask",
          showOnDesktop: true,
          showOnMobile: false,
        },
      };

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: "mandatory",
        },
        adapterSettings: {
          uxMode: "popup",
          whiteLabel: {
            name: "OpenPayment",
          },
          network: 'testnet'
        },
      });

      const web3AuthModalPack = new Web3AuthModalPack({
        txServiceUrl: chain.transactionServiceUrl,
      });

      await web3AuthModalPack.init({
        options,
        adapters: [openloginAdapter],
        modalConfig,
      });

      setWeb3AuthModalPack(web3AuthModalPack);
    })();
  }, [chain]);

  // auth-kit implementation
  const loginWeb3Auth = useCallback(async () => {
    if (!web3AuthModalPack) return;

    try {
      const { safes, eoa } = await web3AuthModalPack.signIn();
      const provider =
        web3AuthModalPack.getProvider() as ethers.providers.ExternalProvider;

      // we set react state with the provided values: owner (eoa address), chain, safes owned & web3 provider
      setChainId(chain.id);
      setOwnerAddress(eoa);
      setSafes(safes || []);
      setWeb3Provider(new ethers.providers.Web3Provider(provider));
    } catch (error) {
      console.log("error: ", error);
    }
  }, [chain, web3AuthModalPack]);

  const logoutWeb3Auth = () => {
    web3AuthModalPack?.signOut();
    setOwnerAddress(undefined);
    setSafes([]);
    setChainId(chain.id);
    setWeb3Provider(undefined);
    setSafeSelected(undefined);
    setGelatoTaskId(undefined);
  };

  // current safe selected by the user
  const [safeSelected, setSafeSelected] = useLocalStorage<string | undefined>(
    "safeSelected",
    undefined,
  );

  // TODO: add disconnect owner wallet logic ?

  // conterfactual safe Address if its not deployed yet
  useEffect(() => {
    const getSafeAddress = async () => {
      if (web3Provider) {
        const signer = web3Provider.getSigner();
        const relayPack = new GelatoRelayPack();
        const safeAccountAbstraction = new AccountAbstraction(signer);

        await safeAccountAbstraction.init({ relayPack });

        const hasSafes = safes.length > 0;

        const safeSelected = hasSafes
          ? safes[0]
          : await safeAccountAbstraction.getSafeAddress();

        setSafeSelected(safeSelected);
        if (!hasSafes) setSafes([safeSelected]);
      }
    };

    getSafeAddress();
  }, [safes, web3Provider]);

  const [isRelayerLoading, setIsRelayerLoading] = useState<boolean>(false);
  const [gelatoTaskId, setGelatoTaskId] = useState<string>();

  // refresh the Gelato task id
  useEffect(() => {
    setIsRelayerLoading(false);
    setGelatoTaskId(undefined);
  }, [chainId]);

  // relay-kit implementation using Gelato
  const relayTransaction = async () => {
    if (web3Provider) {
      setIsRelayerLoading(true);

      const signer = web3Provider.getSigner();
      const relayPack = new GelatoRelayPack();
      const safeAccountAbstraction = new AccountAbstraction(signer);

      await safeAccountAbstraction.init({ relayPack });

      if (!safeSelected) throw new Error("safeSelected is undefined");

      // we use a dump safe transfer as a demo transaction
      const dumpSafeTransafer: MetaTransactionData[] = [
        {
          to: safeSelected,
          data: "0x",
          value: utils.parseUnits("0.01", "ether").toString(),
          operation: 0, // OperationType.Call,
        },
      ];

      const options: MetaTransactionOptions = {
        isSponsored: false,
        gasLimit: "600000", // in this alfa version we need to manually set the gas limit
        gasToken: ethers.constants.AddressZero, // native token
      };

      const gelatoTaskId = await safeAccountAbstraction.relayTransaction(
        dumpSafeTransafer,
        options,
      );

      setIsRelayerLoading(false);
      setGelatoTaskId(gelatoTaskId);
    }
  };

  // we can pay Gelato tx relayer fees with native token & USDC
  // TODO: ADD native Safe Balance polling
  // TODO: ADD USDC Safe Balance polling

  // fetch safe address balance with polling
  const safeBalance = useQuery({
    enabled: !!safeSelected,
    queryKey: ["safeBalance", safeSelected],
    queryFn: async () => {
      if (!safeSelected) throw new Error("safeSelected is undefined");
      const balance = await web3Provider?.getBalance(safeSelected);
      return balance?.toString();
    },
  });

  const state = {
    ownerAddress,
    chainId,
    chain,
    safes,

    isAuthenticated,

    web3Provider,

    loginWeb3Auth,
    logoutWeb3Auth,

    setChainId,

    safeSelected,
    safeBalance: safeBalance.data,
    setSafeSelected,

    isRelayerLoading,
    relayTransaction,
    gelatoTaskId,
  };

  return (
    <accountAbstractionContext.Provider value={state}>
      {children}
    </accountAbstractionContext.Provider>
  );
};

export { useAccountAbstraction, AccountAbstractionProvider };
