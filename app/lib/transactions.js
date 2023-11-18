require("dotenv").config();
const ethers = require("ethers");
const { updateTransaction } = require("../models/transactionSchema");
const { cowSwap } = require("../swaps/cow");
let unsubscribe;
const networks = {
  polygon: process.env.POLYGON_URL,
  goerli: process.env.POLYGON_URL,
  celo: process.env.CELO_URL,
  base: process.env.BASE_URL,
};

const watchTransaction = async (wallet, toAddress, network) => {
  const provider = new ethers.providers.JsonRpcProvider(networks[network] || networks.polygon);
  unsubscribe = provider.on("block", async (blockNumber) => {
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
        await updateTransaction(wallet.address, { txStatus: "confirmed" });
        await cowSwap(toAddress);
      }
    }
  });
};

const stopWatching = () => {
  if (unsubscribe) {
    unsubscribe();
  }
};

module.exports = { watchTransaction, stopWatching };
