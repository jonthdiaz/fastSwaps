const mongoose = require('mongoose')
const TransactionSchema = new mongoose.Schema({
  value: Number,
  toAddress: String,
  fromAddress: String,
  publicKey: String,
  txStatus: String
})

const transactionSchema = mongoose.model('transactions', TransactionSchema)
module.exports.updateTransaction = async (address, updateData) => {
  try {
    const updatedTransaction = await transactionSchema.findOneAndUpdate(
      { fromAddress: address },
      updateData,
      { new: true }
    )

    if (updatedTransaction) {
      console.log('Transaction updated:', updatedTransaction)
    } else {
      console.log('No Transaction found with address')
    }
  } catch (err) {
    console.error('Error updating user:', err)
  }
}

module.exports.transactionSchema = transactionSchema
