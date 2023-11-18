const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema({
  value: Number,
  fromNetwork: String,
  toNetwork: String,
  toAddress: String,
  fromAddress: String,
  publicKey: String,
  txStatus: String,
});

const transactionSchema = mongoose.model("transactions", TransactionSchema);
module.exports.updateTransaction = async (address, updateData) => {
  try {
    const updatedTransaction = await transactionSchema.findOneAndUpdate(
      { fromAddress: address },
      updateData,
      { new: true }
    );

    if (updatedTransaction) {
      console.log("Transaction updated:", updatedTransaction);
    } else {
        return null
    }
  } catch (err) {
    console.error("Error updating user:", err);
  }
};
module.exports.findTransaction = async (filter) => {
  try {
    const transaction = await transactionSchema.findOne(filter);
    if (transaction) {
        return transaction
    } else {
      console.log("No transaction found with that address");
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.transactionSchema = transactionSchema;
