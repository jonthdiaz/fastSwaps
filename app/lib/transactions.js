require("dotenv").config();
const ethers = require("ethers");
const { updateTransaction } = require("../models/transactionSchema");
const { cowSwap } = require("../swaps/cow");
let unsubscribe;

const watchTransaction = async (wallet, toAddress, network, amount) => {
    const networks = {
      polygon: process.env.POLYGON_URL,
      celo: process.env.CELO_URL,
      base: process.env.BASE_URL,
    };
  const rpcNetwork=networks[network]
  console.log("rcpnetwork", rpcNetwork)
  console.log("network", network)
  if (!!!network){
      return
  }
  const provider = new ethers.providers.JsonRpcProvider(
    rpcNetwork || networks.polygon
  );

  const blockListener = async (blockNumber) => {
    console.log("New block:", blockNumber);
    const block = await provider.getBlock(blockNumber, true);

    for (const txHash of block.transactions) {
      const tx = await provider.getTransaction(txHash);

      if (tx.to && tx.to.toLowerCase() === wallet.address.toLowerCase()) {
        console.log(
          "Incoming transaction found on block",
          blockNumber,
          ":",
          tx
        );
        await cowSwap(toAddress, amount);
        await updateTransaction(wallet.address, { txStatus: "confirmed" });

        // Unsubscribe from the listener
        provider.off("block", blockListener);
        break;
      }
    }
  };

  // Subscribe to the listener
  provider.on("block", blockListener);
};

const stopWatching = () => {
  if (unsubscribe) {
    unsubscribe();
  }
};

module.exports = { watchTransaction, stopWatching };
