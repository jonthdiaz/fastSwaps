const path = require('path')
const url = require('url');
const ethers = require('ethers');
const { StatusCodes } = require('http-status-codes');
const { watchTransaction } = require('../lib/transactions');
const { transactionSchema }= require('../models/transactionSchema');

exports.create_transaction = async (req, res) => {
  try {
    const wallet = ethers.Wallet.createRandom();
    const value = req.body.value
    const toAddress = req.body.toAddress
    if (value == null){
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid parameter value'});
    }
    if (toAddress == null){
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid parameter address'});
    }
    const newTransaction = new transactionSchema({
        value: value,
        toAddress: toAddress,
        fromAddress: wallet.address,
        publicKey: wallet.publicKey,
        txStatus: "pending"
    })
    await newTransaction.save()
    watchTransaction(wallet.address)
    return res.status(StatusCodes.CREATED).json({"address": wallet.address})

  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error)
  }
}


exports.status_transaction = async (req, res) => {
  const data = []
  try {
      
    return res.json(data)
  } catch (error) {
    res.json(error)
  }
}
