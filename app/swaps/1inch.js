const Web3 = require("web3");
const fetch = require("node-fetch");

require('dotenv').config();



const chainId = 8453; // Chain ID for Binance Smart Chain (BSC)
const web3RpcUrl = "https://rpc.vnet.tenderly.co/devnet/base-felipe/53789165-a134-44da-91b7-99715b1125b1"; // URL for BSC node
const walletAddress = process.env.PUPLIC_KEY; // Your wallet address
const privateKey = process.env.PRIVATE_KEY; // Your wallet's private key. NEVER SHARE THIS WITH ANYONE!


const broadcastApiUrl = "https://api.1inch.dev/tx-gateway/v1.1/" + chainId + "/broadcast";
const apiBaseUrl = "https://api.1inch.dev/swap/v5.2/" + chainId;
const web3 = new Web3.Web3(web3RpcUrl);
const headers = { headers: { Authorization: "Bearer B301Gcy7OzZPKVAQrKFr7wsMH7cTl9wf", accept: "application/json" } };



// Construct full API request URL
function apiRequestUrl(methodName, queryParams) {
    return apiBaseUrl + methodName + "?" + new URLSearchParams(queryParams).toString();
}

// Post raw transaction to the API and return transaction hash
async function broadCastRawTransaction(rawTransaction) {
    return fetch(broadcastApiUrl, {
        method: "post",
        body: JSON.stringify({ rawTransaction }),
        headers: { "Content-Type": "application/json", Authorization: "Bearer B301Gcy7OzZPKVAQrKFr7wsMH7cTl9wf" },
    })
        .then((res) => res.json())
        .then((res) => {
            return res.transactionHash;
        });
}


async function checkAllowance(tokenAddress, walletAddress) {
    url = apiRequestUrl("/approve/allowance", { "tokenAddress": tokenAddress, "walletAddress": walletAddress })
    return fetch(url, {
        method: "get",
        headers: { "Content-Type": "application/json", Authorization: "Bearer B301Gcy7OzZPKVAQrKFr7wsMH7cTl9wf" },
    })
        .then((res) => res.json())
        .then((res) => {
            return res.transactionHash;
        });
}

// Sign and post a transaction, return its hash
async function signAndSendTransaction(transaction) {
    const { rawTransaction } = await web3.eth.accounts.signTransaction(transaction, privateKey);

    return await broadCastRawTransaction(rawTransaction);
}
const unoInch = async ()=>{
    const swapParams = {
        src: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Token address of 1INCH
        dst: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // Token address of DAI
        amount: "1000000000000000", // Amount of  swap (in wei)
        from: walletAddress,
        slippage: 1, // Maximum acceptable slippage percentage for the swap (e.g., 1 for 1%)
        disableEstimate: false, // Set to true to disable estimation of swap details
        allowPartialFill: false, // Set to true to allow partial filling of the swap order
    };

    const allowance = await checkAllowance(swapParams.src, walletAddress);
    console.log("Allowance: ", allowance);


    async function buildTxForApproveTradeWithRouter(tokenAddress, amount) {
        const url = apiRequestUrl("/approve/transaction", amount ? { tokenAddress, amount } : { tokenAddress });

        const transaction = await fetch(url, headers).then((res) => console.log(res));

        console.log(transaction);

        const gasLimit = await web3.eth.estimateGas({
            ...transaction,
            from: walletAddress,
        });

        return {
            ...transaction,
            gas: gasLimit,
        };
    }

    const transactionForSign = await buildTxForApproveTradeWithRouter(swapParams.src);
    console.log("Transaction for approve: ", transactionForSign);


    const approveTxHash = await signAndSendTransaction(transactionForSign);
    console.log("Approve tx hash: ", approveTxHash);


    async function buildTxForSwap(swapParams) {
        const url = apiRequestUrl("/swap", swapParams);

        // Fetch the swap transaction details from the API
        return fetch(url, headers)
            .then((res) => res.json())
            .then((res) => res.tx);
    }

    const swapTransaction = await buildTxForSwap(swapParams);
    console.log("Transaction for swap: ", swapTransaction);


    const swapTxHash = await signAndSendTransaction(swapTransaction);
    console.log("Swap tx hash: ", swapTxHash);

}

    (async () => {
        try {
            const text = await unoInch();
            console.log(text);
        } catch (e) {
           console.log(e)
        }
        // `text` is not available here
    })();