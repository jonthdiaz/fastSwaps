const ethers = require('ethers');
const network = "mainnet"
const provider = new ethers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/_2a_sGwfk_DGCA4V1Nbh5uAen-6032Pw")
const {updateTransaction} = require('../models/transactionSchema');

let unsubscribe

const watchTransaction=async(address)=>{
    unsubscribe= provider.on('block', async (blockNumber) => {
      console.log('New block:', blockNumber);
      const block = await provider.getBlock(blockNumber, true);
      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
           console.log('Incoming transaction found on block', blockNumber, ':', tx);
           await updateTransaction(address, {"txStatus": "confirmed"})
           stopWatching()
        }
      }
    });
}

const stopWatching = () => {
    if (unsubscribe) {
        unsubscribe();
    }
};

module.exports = { watchTransaction, stopWatching };
