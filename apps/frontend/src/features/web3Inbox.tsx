import {
    useManageSubscription,
    useW3iAccount,
    useInitWeb3InboxClient,
    useMessages
} from '@web3inbox/widget-react'
import {useCallback, useEffect, useState} from 'react'
import { useSignMessage, useAccount } from 'wagmi'
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Item} from "@/features/Invoice.tsx";

export const MessageSchema = z.object({
    id: z.number(),
    topic: z.string(),
    message: z.object({
        id: z.string(),
        type: z.string(),
        title: z.string(),
        body: z.string(),
        icon: z.string(),
        orderId: z.string().optional(),
        url: z.string()
    }),
    publishedAt: z.number()
})


export function Web3Inbox(props: {
    invoiceId: string
}) {
    console.log("Web3Inbox", props.invoiceId)
    const { address } = useAccount()
    const [isRegisteredINEffect, setIsRegisteredINEffect] = useState(false)
    const { signMessageAsync } = useSignMessage()

    // Initialize the Web3Inbox SDK
    const isReady = useInitWeb3InboxClient({
        // The project ID and domain you setup in the Domain Setup section
        projectId:"b769195d525fcd74f9ac88723ad1b8c5",
        domain: 'api.blabla.pink',

        // Allow localhost development with "unlimited" mode.
        // This authorizes this dapp to control notification subscriptions for all domains (including `app.example.com`), not just `window.location.host`
        isLimited: false
    })

    const { account, setAccount, isRegistered, isRegistering, register } = useW3iAccount()
    useEffect(() => {
        if (!address) return
        // Convert the address into a CAIP-10 blockchain-agnostic account ID and update the Web3Inbox SDK with it
        setAccount(`eip155:1:${address}`)
    }, [address, setAccount])


    // In order to authorize the dapp to control subscriptions, the user needs to sign a SIWE message which happens automatically when `register()` is called.
    // Depending on the configuration of `domain` and `isLimited`, a different message is generated.
    const performRegistration = useCallback(async () => {
        if (!address) return
        try {
            await register(message => signMessageAsync({ message }))
        } catch (registerIdentityError) {
            alert(registerIdentityError)
        }
    }, [signMessageAsync, register, address])

    useEffect(() => {
        // Register even if an identity key exists, to account for stale keys
        performRegistration()
    }, [performRegistration])

    const { isSubscribed, isSubscribing, subscribe } = useManageSubscription()

    const performSubscribe = useCallback(async () => {
        // Register again just in case
        await performRegistration()
        await subscribe()
    }, [subscribe, isRegistered])

    // const { subscription } = useSubscription()
    const { messages } = useMessages()
    console.log("999999", messages)

    const filteredMessages = messages.map((message) => {
        const parsed = MessageSchema.parse(message)
        return parsed
    }).filter((message) => {
        console.log("inside filter", {
            message,
            props,
            id: message.message.url.split('/').pop()
        })
        return message.message.url.split('/').pop() === props.invoiceId
    })


    if (!isReady) return <div className="text-center text-gray-400 my-5">Loading notifications...</div>

    if (!isSubscribed) return <div className="flex flex-col items-center w-full mt-5">
        <p className="text-gray-400 text-center">Not subscribed</p>
            <>
                <Button className="mt-5" onClick={performSubscribe} disabled={isSubscribing}>
                    {isSubscribing ? 'Subscribing...' : 'Subscribe to notifications'}
                </Button>
            </>
    </div>

    return (
        <div className="text-success-400 mt-5 w-full max-w-2xl mx-auto">
            {!isReady ? (
                <div className="flex flex-col justify-center gap-5">
                    <p className="text-center">Loading client...</p>
                    <Skeleton />
                </div>
            ) : (
                <div className="w-full">
                    {!address ? (
                        <div className="text-center py-2">Connect your wallet</div>
                    ) : (
                        <div className="text-sm">
                            <Item sm title="Address" value={address} />
                            <Item sm title="Account ID" value={account} />
                            {!isRegistered ? (
                                <div>
                                    To manage notifications, sign and register an identity key:&nbsp;
                                    <Button className="ml-2" variant="ghost" onClick={performRegistration} disabled={isRegistering}>
                                        {isRegistering ? 'Signing...' : 'Sign'}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {!isSubscribed ? (
                                        <>
                                            <Button className="mt-5" onClick={performSubscribe} disabled={isSubscribing}>
                                                {isSubscribing ? 'Subscribing...' : 'Subscribe to notifications'}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col justify-center items-center mt-5 gap-3">
                                            <div className="">You are subscribed</div>
                                            {filteredMessages[0] ?
                                                <div className="flex flex-col gap-3">
                                                    <h1 className="text-base text-center">Messages from seller:</h1>
                                                    <div className="text-base text-center">{JSON.stringify(filteredMessages[0].message.title)}</div>
                                                    <div className="text-sm text-center">{JSON.stringify(filteredMessages[0].message.url)}</div>
                                                    <div className="text-sm text-center">{JSON.stringify(filteredMessages[0].message.body)}</div>
                                                </div>
                                                : <div>No messages from seller</div>
                                            }
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
