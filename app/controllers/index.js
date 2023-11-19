const path = require("path");
const url = require("url");
const ethers = require("ethers");
const { StatusCodes } = require("http-status-codes");
const { watchTransaction } = require("../lib/transactions");
const fetch = require("node-fetch");

const {
  transactionSchema,
  findTransaction,
} = require("../models/transactionSchema");
const { add } = require("nodemon/lib/rules");

exports.create_transaction = async (req, res) => {
  try {
    const value = req.body.value;
    const toAddress = req.body.toAddress;
    const fromNetwork = req.body.fromNetwork;
    const toNetwork = req.body.toNetwork;
    const network = req.body.network;
    if (value == null) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid parameter value" });
    }
    if (toAddress == null) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid parameter address" });
    }
    if (fromNetwork == null) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid parameter from network" });
    }
    if (toNetwork == null) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid parameter to network" });
    }
    const wallet = ethers.Wallet.createRandom();
    const newTransaction = new transactionSchema({
      value: value,
      toAddress: toAddress,
      fromAddress: wallet.address,
      fromNetwork: fromNetwork,
      toNetwork: toNetwork,
      publicKey: wallet.publicKey,
      txStatus: "pending",
      network: network,
    });
    await newTransaction.save();
    watchTransaction(wallet, toAddress, network, value);
    return res
      .status(StatusCodes.CREATED)
      .json({ result: { address: wallet.address }, success: true });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
};

exports.status_transaction = async (req, res) => {
  try {
    const address = req.params.address;
    const transition = await findTransaction({ fromAddress: address, txStatus: "confirmed" });
    if (transition) {
      res.json({ success: true, result: transition });
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Transaction has not been confirmed", success: false });
    }
  } catch (err) {
    console.log("error", err);
    res.json(err);
  }
};

exports.prices = async (req, res) => {
  try {
    const urls = [
      'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=eth',
      'https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=eth',
    ]

    let coins_prices = []
    for (const url of urls) {
      coins_prices.push(await fetch(
           url,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
          }
        }
      ).then((response) => response.json()))
    }

    res.json(coins_prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
  }
};



