import {Address, createPublicClient, http} from "viem";
import {goerli} from "viem/chains";
import erc20ABI from "backend/src/payment-checker/erc20Abi.json";

export const ENABLED_TOKENS_GOERLI = [
     {address: "0x70cBa46d2e933030E2f274AE58c951C800548AeF", name: "BAT", network: "goerli", icon: "/images/bat.png"},
     {address: "0x91056D4A53E1faa1A84306D4deAEc71085394bC8", name: "COW", network: "goerli", icon: "/images/cow.png"},
     {address: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60", name: "DAI", network: "goerli", icon: "/images/dai.png"},
     {address: "0x02abbdbaaa7b1bb64b5c878f7ac17f8dda169532", name: "GNO", network: "goerli", icon: "/images/gno.png"},
     {address: "0x9e32c0EfF886B6Ccae99350Fd5e7002dCED55F15", name: "POLY", network: "goerli", icon: "/images/poly.png"},
     {address: "0x07865c6e87b9f70255377e024ace6630c1eaa37f", name: "USDC", network: "goerli", icon: "/images/usdc.png"},
     {address: "0xe4E81Fa6B16327D4B78CFEB83AAdE04bA7075165", name: "ZRX", network: "goerli", icon: "/images/zrx.png"},
]

export const viemPublic = createPublicClient({
    chain: goerli,
    transport: http("https://goerli.infura.io/v3/53f3337eeacb44089e2285462c9e80d6")
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
    return balance ? balance.toString() : '0'
}

export const usdcContractAddress = '0x07865c6e87b9f70255377e024ace6630c1eaa37f' // GOERLI https://faucet.allianceblock.io/
