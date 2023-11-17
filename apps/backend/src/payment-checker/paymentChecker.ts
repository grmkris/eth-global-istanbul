/**
 * Check invoices table, get all pending invoices
 * Check blockchain, if there are any new payments
 */
import {db} from "../db/db";
import {Address, createPublicClient, http} from "viem";
import {goerli} from "viem/chains";
import {invoices} from "../db/invoices";
import {insertPaymentSchema, payments, selectPaymentSchema} from "../db/payments";
import {eq} from "drizzle-orm";
import erc20ABI from "./erc20Abi.json";
const viemPublic = createPublicClient({
    chain: goerli,
    transport: http()
})


const usdcContractAddress = '0x30A01fe57Fe433D17DD168EAF80Bd91f2719f7D9' // GOERLI https://faucet.allianceblock.io/
export async function checkInvoices() {
    console.log("Checking invoices")
    const unpaidInvoices = await db.query.invoices.findMany({
        where: ((invoices, { eq }) => eq(invoices.status, 'pending')),
    });

    const currentBlock = await viemPublic.getBlockNumber();

    console.log("current block", currentBlock)
    const blockToCheckFrom = currentBlock - BigInt(1000);

    if (unpaidInvoices.length === 0) {
        console.log("no unpaid invoices")
        return
    }

    console.log("blockToCheckFrom", blockToCheckFrom)
    const logs = await viemPublic.getContractEvents({
        address: usdcContractAddress,
        abi: erc20ABI,
        eventName: 'Transfer',
        args: {
            to: unpaidInvoices[0].wallet
        },
        fromBlock: blockToCheckFrom,
        toBlock: currentBlock
    })

    console.log("res", logs)

    console.log("txes in last 1000 blocks", logs.length);

    for (const transfer of logs) {
        // check if payment with txhash already exists
        const payment = await db.query.payments.findMany({
            where: eq(payments.transactionId, transfer.transactionHash)
        });
        if (payment.length > 0) {
            console.log("payment already exists", payment)
            continue
        }
        console.log("transfer", transfer)
        const newPayment = {
            id: crypto.randomUUID(),
            invoiceId: unpaidInvoices[0].id,
            createdAt: new Date(),
            paymentDate: new Date(),
            paymentMethod: "wallet",
            amountPaid: transfer.args.value,
            transactionId: transfer.transactionHash,
        } satisfies selectPaymentSchema;

        const result = await db.insert(payments).values(newPayment).returning().execute();
        const result2 = await db.update(invoices).set({status: "paid", payerWallet: transfer.from}).where(eq(invoices.id, unpaidInvoices[0].id)).execute();

        console.log("paid", {
            result, result2
        })
    }
}
